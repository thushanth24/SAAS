import type { Express, Request as ExpressRequest, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";
import session from "express-session";
import MemoryStore from "memorystore";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import crypto from "crypto";

// Extend Express Request type to include subdomain
declare global {
  namespace Express {
    interface Request {
      subdomain?: string;
    }
  }
  
  // Extend session
  namespace Express.Session {
    interface SessionData {
      userId?: number;
      cartSessionId?: string;
      pendingRegistration?: {
        userId: number;
        storeName: string;
        subdomain: string;
      };
      customerId?: number;
    }
  }
}

// Use the augmented Request type
type Request = ExpressRequest;
import {
  registerSchema,
  loginSchema,
  otpVerificationSchema,
  insertProductSchema,
  insertCategorySchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
} from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing Stripe secret key. Set STRIPE_SECRET_KEY environment variable for payment functionality.');
}

// Initialize Stripe if key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Helper to generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Extract subdomain from host
function extractSubdomain(host: string): string | null {
  // Handle if host is undefined or empty
  if (!host) {
    return null;
  }
  
  // Check if it's an IP address
  if (/^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(host)) {
    return null;
  }

  // Handle localhost special case
  if (host === "localhost" || host.startsWith("localhost:")) {
    return null;
  }

  // Remove port if present
  const hostWithoutPort = host.split(":")[0];
  
  // Split by dots and check if we have enough parts for a subdomain
  const parts = hostWithoutPort.split(".");
  if (parts.length >= 3) {
    return parts[0];
  }
  
  // URL parameter check is not needed here as this function only processes the host header
  // We handle URL parameters separately in the middleware
  
  return null;
}

// Tenant middleware
function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  // First check the host header for subdomain
  let subdomain = extractSubdomain(req.get("host") || "");
  
  // If no subdomain found in host, check URL parameters
  if (!subdomain && req.query.subdomain) {
    subdomain = req.query.subdomain as string;
  }
  
  if (subdomain) {
    req.subdomain = subdomain;
  }
  
  next();
}

// Authentication middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Store owner middleware
async function isStoreOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "store_owner") {
    return res.status(403).json({ message: "Forbidden: Only store owners can access this resource" });
  }
  
  next();
}

// Ensure valid store for authenticated user (for store owner routes)
async function ensureValidStore(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const storeId = parseInt(req.params.storeId || '0');
  if (!storeId) {
    return res.status(400).json({ message: "Store ID is required" });
  }
  
  const store = await storage.getStore(storeId);
  if (!store) {
    return res.status(404).json({ message: "Store not found" });
  }
  
  if (store.ownerId !== req.session.userId) {
    return res.status(403).json({ message: "Forbidden: You don't have access to this store" });
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "shopease-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 },
      store: new SessionStore({
        checkPeriod: 86400000, // 24 hours
      }),
    })
  );

  // Apply the tenant middleware
  app.use(tenantMiddleware);

  // Authentication endpoints
  // Add health check endpoint
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });
  
  // Setup store route - for testing with dummy data
  app.post("/api/setup/test-store", async (req, res) => {
    try {
      // Create test user
      const user = await storage.createUser({
        username: "testuser",
        password: "password123", 
        email: "test@example.com",
        phone: "1234567890",
        role: "store_owner"
      });
      
      console.log("Created test user:", user);
      
      // Create test store
      const store = await storage.createStore({
        ownerId: user.id,
        name: "Test Store",
        subdomain: "test-store",
        description: "A test store",
        logo: "",
        theme: {
          primaryColor: "#4F46E5",
          secondaryColor: "#f97316",
          fontFamily: "Inter",
        },
        plan: "basic",
      });
      
      console.log("Created test store:", store);
      
      // Set session
      req.session.userId = user.id;
      
      res.status(200).json({
        message: "Test store created successfully",
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          username: user.username,
          role: user.role,
        },
        store: {
          id: store.id,
          name: store.name,
          subdomain: store.subdomain,
        }
      });
    } catch (error) {
      console.error("Error creating test store:", error);
      res.status(500).json({ message: "Failed to create test store" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log("Registration request body:", req.body);
      
      // Manually validate each field to provide detailed error messages
      if (!req.body.storeName) {
        return res.status(400).json({ message: "Store name is required" });
      }
      if (!req.body.subdomain) {
        return res.status(400).json({ message: "Subdomain is required" });
      }
      if (!req.body.email) {
        return res.status(400).json({ message: "Email is required" });
      }
      if (!req.body.phone) {
        return res.status(400).json({ message: "Phone number is required" });
      }
      if (!req.body.password) {
        return res.status(400).json({ message: "Password is required" });
      }
      
      const data = registerSchema.parse(req.body);
      console.log("Registration data validated successfully:", data);
      
      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(data.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      const existingUserByPhone = await storage.getUserByPhone(data.phone);
      if (existingUserByPhone) {
        return res.status(400).json({ message: "Phone number already in use" });
      }
      
      // Check if subdomain is available
      const existingStore = await storage.getStoreBySubdomain(data.subdomain);
      if (existingStore) {
        return res.status(400).json({ message: "Subdomain already in use" });
      }
      
      // Create user
      const username = data.email.split("@")[0];
      const user = await storage.createUser({
        username,
        password: data.password, // In a real app, hash this password
        email: data.email,
        phone: data.phone,
        role: "store_owner",
      });
      
      // Generate and store OTP
      const otpCode = generateOTP();
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 10); // OTP valid for 10 minutes
      
      await storage.createOTP({
        userId: user.id,
        otp: otpCode,
        expiresAt: expiryTime,
      });
      
      // In a real app, send OTP via Text.lk or similar service
      console.log(`OTP for ${user.phone}: ${otpCode}`);
      
      // Store data temporarily in session for completion after OTP verification
      req.session.pendingRegistration = {
        userId: user.id,
        storeName: data.storeName,
        subdomain: data.subdomain,
      };
      
      res.status(200).json({
        message: "Registration initiated. Please verify your phone number with the OTP.",
        userId: user.id,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(data.email);
      if (!user || user.phone !== data.phone) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      
      // Generate and store OTP
      const otpCode = generateOTP();
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 10); // OTP valid for 10 minutes
      
      await storage.createOTP({
        userId: user.id,
        otp: otpCode,
        expiresAt: expiryTime,
      });
      
      // In a real app, send OTP via Text.lk or similar service
      console.log(`OTP for ${user.phone}: ${otpCode}`);
      
      res.status(200).json({
        message: "OTP sent to your phone number",
        userId: user.id,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const data = otpVerificationSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(data.email);
      if (!user || user.phone !== data.phone) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      
      // Validate OTP
      const isValid = await storage.validateOTP(user.id, data.otp);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      
      // Mark OTP as used
      const otp = await storage.getOTPByUserId(user.id);
      if (otp) {
        await storage.markOTPAsUsed(otp.id);
      }
      
      // Complete registration if pending
      if (req.session.pendingRegistration && req.session.pendingRegistration.userId === user.id) {
        // Update user as verified
        await storage.updateUser(user.id, { isVerified: true });
        
        // Create store
        await storage.createStore({
          ownerId: user.id,
          name: req.session.pendingRegistration.storeName,
          subdomain: req.session.pendingRegistration.subdomain,
          description: "",
          logo: "",
          theme: {
            primaryColor: "#4F46E5",
            secondaryColor: "#f97316",
            fontFamily: "Inter",
          },
          plan: "basic",
        });
        
        // Clear pending registration
        delete req.session.pendingRegistration;
      } else {
        // Regular login
        // Update user as verified if not already
        if (!user.isVerified) {
          await storage.updateUser(user.id, { isVerified: true });
        }
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Get user stores to return in response
      const stores = await storage.getStoresByOwnerId(user.id);
      
      res.status(200).json({
        message: "Authentication successful",
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          username: user.username,
          role: user.role,
        },
        stores: stores.map(store => ({
          id: store.id,
          name: store.name,
          subdomain: store.subdomain,
          logo: store.logo,
        })),
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/session", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ authenticated: false });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ authenticated: false });
    }
    
    const stores = await storage.getStoresByOwnerId(user.id);
    
    res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        username: user.username,
        role: user.role,
      },
      stores: stores.map(store => ({
        id: store.id,
        name: store.name,
        subdomain: store.subdomain,
        logo: store.logo,
      })),
    });
  });

  // Stripe is already initialized at the top of the file

  // Payment integration endpoints
  app.post('/api/create-payment-intent', async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }

      const { amount, cartId } = req.body;
      
      if (!amount || !cartId) {
        return res.status(400).json({ message: "Amount and cartId are required" });
      }

      // Get cart to verify it exists and belongs to the user
      const cart = await storage.getCart(cartId);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      // Check cart ownership if user is logged in
      if (req.session.userId && cart.customerId && cart.customerId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized access to this cart" });
      }

      // Check session ownership if user is not logged in
      if (!req.session.userId && cart.sessionId !== req.session.cartSessionId) {
        return res.status(403).json({ message: "Unauthorized access to this cart" });
      }

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        // Store the cart ID as metadata for later use
        metadata: {
          cartId: cartId.toString(),
          storeId: cart.storeId.toString()
        }
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });
  
  // Complete checkout after payment is successful
  app.post('/api/checkout/complete', async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }

      const { paymentIntentId, cartId, shippingAddress } = req.body;
      
      if (!paymentIntentId || !cartId || !shippingAddress) {
        return res.status(400).json({ message: "Missing required checkout information" });
      }

      // Verify payment intent was successful
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment has not been completed" });
      }

      // Get cart
      const cart = await storage.getCart(parseInt(cartId));
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      // Get cart items
      const cartItems = await storage.getCartItems(cart.id);
      if (!cartItems.length) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Create customer if not already exists
      let customerId = cart.customerId;
      if (!customerId && req.session.userId) {
        customerId = req.session.userId;
      }

      // Create order
      const order = await storage.createOrder({
        storeId: cart.storeId,
        customerId: customerId,
        status: "paid",
        total: parseFloat(paymentIntent.amount.toString()) / 100, // Convert cents to dollars
        shippingAddress: JSON.stringify(shippingAddress),
        paymentIntentId: paymentIntent.id
      });

      // Create order items
      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          await storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat(product.price), // Assuming price is stored as string
            metadata: JSON.stringify({
              productName: product.name,
              productSku: product.sku
            })
          });
        }
      }

      // Clear the cart after successful checkout
      await storage.deleteCart(cart.id);
      if (req.session.cartSessionId) {
        delete req.session.cartSessionId;
      }

      res.status(200).json({
        success: true,
        orderId: order.id
      });
    } catch (error) {
      console.error('Error completing checkout:', error);
      res.status(500).json({ message: "Failed to complete checkout" });
    }
  });

  // Storefront endpoint for subdomain access
  app.get("/api/storefront", async (req, res) => {
    try {
      const subdomain = req.subdomain || req.query.subdomain as string;
      
      // For development/testing, if no subdomain is provided, create a demo store
      if (!subdomain) {
        console.log('No subdomain provided, returning demo store for development');
        
        // Check if we have a demo store, if not create one
        let demoStore = await storage.getStoreBySubdomain('demo');
        
        if (!demoStore) {
          // Create a demo user if needed
          let demoUser = await storage.getUserByEmail('demo@example.com');
          if (!demoUser) {
            demoUser = await storage.createUser({
              username: 'demo',
              email: 'demo@example.com',
              phone: '+1234567890',
              password: 'demo123',
              role: 'store_owner',
              isVerified: true
            });
          }
          
          // Create a demo store
          demoStore = await storage.createStore({
            ownerId: demoUser.id,
            name: 'Demo Store',
            subdomain: 'demo',
            description: 'This is a demo store for testing the application',
            logo: 'https://via.placeholder.com/150',
            theme: {
              primaryColor: '#4F46E5',
              secondaryColor: '#f97316',
              fontFamily: 'Inter'
            },
            plan: 'basic'
          });
          
          // Create demo categories
          const category1 = await storage.createCategory({
            storeId: demoStore.id,
            name: 'Electronics',
            description: 'Electronic devices and accessories'
          });
          
          const category2 = await storage.createCategory({
            storeId: demoStore.id,
            name: 'Clothing',
            description: 'Fashion items and accessories'
          });
          
          // Create demo products
          await storage.createProduct({
            storeId: demoStore.id,
            categoryId: category1.id,
            name: 'Wireless Headphones',
            description: 'High-quality wireless headphones with noise cancellation',
            price: '149.99',
            compareAtPrice: '199.99',
            sku: 'WH-001',
            inventory: 50,
            images: ['https://via.placeholder.com/600x400'],
            featured: true
          });
          
          await storage.createProduct({
            storeId: demoStore.id,
            categoryId: category1.id,
            name: 'Smartphone',
            description: 'Latest smartphone with advanced features',
            price: '799.99',
            compareAtPrice: '899.99',
            sku: 'SP-001',
            inventory: 30,
            images: ['https://via.placeholder.com/600x400'],
            featured: true
          });
          
          await storage.createProduct({
            storeId: demoStore.id,
            categoryId: category2.id,
            name: 'T-Shirt',
            description: 'Comfortable cotton t-shirt',
            price: '19.99',
            compareAtPrice: '24.99',
            sku: 'TS-001',
            inventory: 100,
            images: ['https://via.placeholder.com/600x400'],
            featured: true
          });
          
          await storage.createProduct({
            storeId: demoStore.id,
            categoryId: category2.id,
            name: 'Jeans',
            description: 'Classic denim jeans',
            price: '49.99',
            compareAtPrice: '59.99',
            sku: 'JN-001',
            inventory: 75,
            images: ['https://via.placeholder.com/600x400'],
            featured: true
          });
        }
        
        // Get store categories
        const categories = await storage.getCategoriesByStoreId(demoStore.id);
        
        // Get featured products
        const featuredProducts = await storage.getFeaturedProducts(demoStore.id, 4);
        
        return res.status(200).json({
          store: demoStore,
          categories,
          featuredProducts
        });
      }
      
      // Regular flow for actual subdomain
      const store = await storage.getStoreBySubdomain(subdomain);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      // Get store categories
      const categories = await storage.getCategoriesByStoreId(store.id);
      
      // Get featured products
      const featuredProducts = await storage.getFeaturedProducts(store.id, 4);
      
      res.status(200).json({
        store,
        categories,
        featuredProducts
      });
    } catch (error) {
      console.error('Error fetching storefront data:', error);
      res.status(500).json({ message: "Failed to fetch storefront data" });
    }
  });
  
  // Store Management endpoints
  app.get("/api/stores", isAuthenticated, async (req, res) => {
    const stores = await storage.getStoresByOwnerId(req.session.userId);
    res.status(200).json(stores);
  });

  app.get("/api/stores/:storeId", isAuthenticated, ensureValidStore, async (req, res) => {
    const storeId = parseInt(req.params.storeId);
    const store = await storage.getStore(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.status(200).json(store);
  });

  app.patch("/api/stores/:storeId", isAuthenticated, ensureValidStore, async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      const store = await storage.updateStore(storeId, req.body);
      res.status(200).json(store);
    } catch (error) {
      res.status(500).json({ message: "Failed to update store" });
    }
  });

  // Category Management endpoints
  app.get("/api/stores/:storeId/categories", async (req, res) => {
    const storeId = parseInt(req.params.storeId);
    const categories = await storage.getCategoriesByStoreId(storeId);
    res.status(200).json(categories);
  });

  app.post("/api/stores/:storeId/categories", isAuthenticated, ensureValidStore, async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      const categoryData = insertCategorySchema.parse({ ...req.body, storeId });
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.patch("/api/categories/:categoryId", isAuthenticated, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const category = await storage.getCategory(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Check if user owns the store
      const store = await storage.getStore(category.storeId);
      if (!store || store.ownerId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden: You don't have access to this category" });
      }
      
      const updatedCategory = await storage.updateCategory(categoryId, req.body);
      res.status(200).json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:categoryId", isAuthenticated, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const category = await storage.getCategory(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Check if user owns the store
      const store = await storage.getStore(category.storeId);
      if (!store || store.ownerId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden: You don't have access to this category" });
      }
      
      await storage.deleteCategory(categoryId);
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Product Management endpoints
  app.get("/api/stores/:storeId/products", async (req, res) => {
    const storeId = parseInt(req.params.storeId);
    const products = await storage.getProductsByStoreId(storeId);
    res.status(200).json(products);
  });

  app.get("/api/stores/:storeId/products/featured", async (req, res) => {
    const storeId = parseInt(req.params.storeId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
    const products = await storage.getFeaturedProducts(storeId, limit);
    res.status(200).json(products);
  });

  app.get("/api/categories/:categoryId/products", async (req, res) => {
    const categoryId = parseInt(req.params.categoryId);
    const products = await storage.getProductsByCategory(categoryId);
    res.status(200).json(products);
  });

  app.get("/api/products/:productId", async (req, res) => {
    const productId = parseInt(req.params.productId);
    const product = await storage.getProduct(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.status(200).json(product);
  });

  app.post("/api/stores/:storeId/products", isAuthenticated, ensureValidStore, async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      const productData = insertProductSchema.parse({ ...req.body, storeId });
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch("/api/products/:productId", isAuthenticated, async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if user owns the store
      const store = await storage.getStore(product.storeId);
      if (!store || store.ownerId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden: You don't have access to this product" });
      }
      
      const updatedProduct = await storage.updateProduct(productId, req.body);
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:productId", isAuthenticated, async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if user owns the store
      const store = await storage.getStore(product.storeId);
      if (!store || store.ownerId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden: You don't have access to this product" });
      }
      
      await storage.deleteProduct(productId);
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Cart Management endpoints
  app.post("/api/carts", async (req, res) => {
    try {
      const { storeId, customerId } = req.body;
      
      if (!storeId) {
        return res.status(400).json({ message: "Store ID is required" });
      }
      
      // Generate a session ID if not logged in as a customer
      let sessionId = req.session.cartSessionId;
      if (!sessionId) {
        sessionId = crypto.randomBytes(16).toString("hex");
        req.session.cartSessionId = sessionId;
      }
      
      // Check if cart already exists
      let cart;
      if (customerId) {
        cart = await storage.getCartByCustomerId(customerId);
      } else if (sessionId) {
        cart = await storage.getCartBySessionId(sessionId);
      }
      
      // Create new cart if doesn't exist
      if (!cart) {
        cart = await storage.createCart({
          storeId: parseInt(storeId),
          customerId: customerId ? parseInt(customerId) : null,
          sessionId,
        });
      }
      
      res.status(201).json(cart);
    } catch (error) {
      res.status(500).json({ message: "Failed to create cart" });
    }
  });

  app.get("/api/carts/:cartId", async (req, res) => {
    try {
      const cartId = parseInt(req.params.cartId);
      const cart = await storage.getCart(cartId);
      
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      
      // Check if cart belongs to the session
      if (!req.session.userId && cart.sessionId !== req.session.cartSessionId) {
        return res.status(403).json({ message: "Forbidden: You don't have access to this cart" });
      }
      
      // Get cart items
      const cartItems = await storage.getCartItems(cartId);
      
      // Get product details for each item
      const itemsWithDetails = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product,
          };
        })
      );
      
      res.status(200).json({
        cart,
        items: itemsWithDetails,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get cart" });
    }
  });

  app.post("/api/carts/:cartId/items", async (req, res) => {
    try {
      const cartId = parseInt(req.params.cartId);
      const cart = await storage.getCart(cartId);
      
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      
      // Check if cart belongs to the session
      if (!req.session.userId && cart.sessionId !== req.session.cartSessionId) {
        return res.status(403).json({ message: "Forbidden: You don't have access to this cart" });
      }
      
      const cartItemData = insertCartItemSchema.parse({ ...req.body, cartId });
      const cartItem = await storage.addCartItem(cartItemData);
      
      // Get product details
      const product = await storage.getProduct(cartItem.productId);
      
      res.status(201).json({
        ...cartItem,
        product,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.patch("/api/cart-items/:itemId", async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const { quantity } = req.body;
      
      if (quantity === undefined) {
        return res.status(400).json({ message: "Quantity is required" });
      }
      
      const cartItem = await storage.updateCartItemQuantity(itemId, quantity);
      
      // Get product details
      const product = await storage.getProduct(cartItem.productId);
      
      res.status(200).json({
        ...cartItem,
        product,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart-items/:itemId", async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      await storage.removeCartItem(itemId);
      res.status(200).json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  // Order Management endpoints
  app.get("/api/stores/:storeId/orders", isAuthenticated, ensureValidStore, async (req, res) => {
    const storeId = parseInt(req.params.storeId);
    const orders = await storage.getOrdersByStoreId(storeId);
    
    // Get customer details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        let customer = null;
        if (order.customerId) {
          customer = await storage.getCustomer(order.customerId);
        }
        return {
          ...order,
          customer,
        };
      })
    );
    
    res.status(200).json(ordersWithDetails);
  });

  app.get("/api/orders/:orderId", isAuthenticated, async (req, res) => {
    const orderId = parseInt(req.params.orderId);
    const order = await storage.getOrder(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if user owns the store or is the customer
    const store = await storage.getStore(order.storeId);
    if (!store || (store.ownerId !== req.session.userId && (!order.customerId || req.session.customerId !== order.customerId))) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this order" });
    }
    
    // Get order items
    const orderItems = await storage.getOrderItems(orderId);
    
    // Get product details for each item
    const itemsWithDetails = await Promise.all(
      orderItems.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          ...item,
          product,
        };
      })
    );
    
    // Get customer details
    let customer = null;
    if (order.customerId) {
      customer = await storage.getCustomer(order.customerId);
    }
    
    res.status(200).json({
      ...order,
      items: itemsWithDetails,
      customer,
    });
  });

  app.patch("/api/orders/:orderId/status", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user owns the store
      const store = await storage.getStore(order.storeId);
      if (!store || store.ownerId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden: You don't have access to this order" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Storefront endpoints
  app.get("/api/storefront", async (req, res) => {
    try {
      // Extract subdomain from request
      const subdomain = req.subdomain;
      
      if (!subdomain) {
        return res.status(400).json({ message: "No subdomain found in request" });
      }
      
      // Get store by subdomain
      const store = await storage.getStoreBySubdomain(subdomain);
      
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      // Get categories
      const categories = await storage.getCategoriesByStoreId(store.id);
      
      // Get featured products
      const featuredProducts = await storage.getFeaturedProducts(store.id, 4);
      
      res.status(200).json({
        store,
        categories,
        featuredProducts,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get storefront data" });
    }
  });

  // Subscription Plans endpoints
  app.get("/api/subscription-plans", async (req, res) => {
    const plans = await storage.getSubscriptionPlans();
    res.status(200).json(plans);
  });

  // Stripe payment endpoints
  if (stripe) {
    app.post("/api/checkout/complete", async (req, res) => {
      try {
        const { paymentIntentId, cartId, shippingAddress } = req.body;
        
        if (!paymentIntentId || !cartId || !shippingAddress) {
          return res.status(400).json({ message: "Missing required fields" });
        }
        
        const cart = await storage.getCart(parseInt(cartId));
        if (!cart) {
          return res.status(404).json({ message: "Cart not found" });
        }
        
        // Get cart items
        const cartItems = await storage.getCartItems(cart.id);
        
        // Calculate total
        let total = 0;
        for (const item of cartItems) {
          const product = await storage.getProduct(item.productId);
          if (product) {
            total += parseFloat(product.price.toString()) * item.quantity;
          }
        }
        
        // Create order
        const order = await storage.createOrder({
          storeId: cart.storeId,
          customerId: cart.customerId,
          total,
          status: "processing",
          shippingAddress,
          paymentMethod: "stripe",
          paymentId: paymentIntentId,
        });
        
        // Create order items
        for (const item of cartItems) {
          const product = await storage.getProduct(item.productId);
          if (product) {
            await storage.createOrderItem({
              orderId: order.id,
              productId: item.productId,
              price: parseFloat(product.price.toString()),
              quantity: item.quantity,
            });
          }
        }
        
        // Delete cart
        await storage.deleteCart(cart.id);
        
        res.status(200).json({
          success: true,
          orderId: order.id,
        });
      } catch (error) {
        console.error("Checkout error:", error);
        res.status(500).json({ message: "Error completing checkout" });
      }
    });

    app.post("/api/get-or-create-subscription", isAuthenticated, async (req, res) => {
      try {
        const { planId } = req.body;
        
        if (!planId) {
          return res.status(400).json({ message: "Plan ID is required" });
        }
        
        const user = await storage.getUser(req.session.userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        const plan = await storage.getSubscriptionPlan(parseInt(planId));
        if (!plan) {
          return res.status(404).json({ message: "Subscription plan not found" });
        }
        
        if (user.stripeSubscriptionId) {
          // Retrieve existing subscription
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          
          res.status(200).json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
          });
          
          return;
        }
        
        if (!user.email) {
          return res.status(400).json({ message: "User email is required" });
        }
        
        // Create or retrieve customer
        let customerId = user.stripeCustomerId;
        
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.username,
            phone: user.phone,
          });
          
          customerId = customer.id;
          await storage.updateUser(user.id, { stripeCustomerId: customerId });
        }
        
        // Create subscription
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [
            {
              price: plan.stripePriceId,
            },
          ],
          payment_behavior: "default_incomplete",
          expand: ["latest_invoice.payment_intent"],
        });
        
        // Update user with subscription ID
        await storage.updateUserStripeInfo(user.id, {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
        });
        
        res.status(200).json({
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        });
      } catch (error) {
        console.error("Subscription error:", error);
        res.status(500).json({ message: "Error creating subscription" });
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
