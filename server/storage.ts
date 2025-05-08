import {
  users,
  otps,
  stores,
  categories,
  products,
  customers,
  carts,
  cartItems,
  orders,
  orderItems,
  subscriptionPlans,
  type User,
  type InsertUser,
  type OTP,
  type InsertOTP,
  type Store,
  type InsertStore,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Customer,
  type InsertCustomer,
  type Cart,
  type InsertCart,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
} from "@shared/schema";

// Storage interface for all entities
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  updateUserStripeInfo(id: number, data: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User>;
  
  // OTP operations
  createOTP(otp: InsertOTP): Promise<OTP>;
  getOTPByUserId(userId: number): Promise<OTP | undefined>;
  validateOTP(userId: number, otpCode: string): Promise<boolean>;
  markOTPAsUsed(id: number): Promise<OTP>;
  
  // Store operations
  getStore(id: number): Promise<Store | undefined>;
  getStoreBySubdomain(subdomain: string): Promise<Store | undefined>;
  getStoresByOwnerId(ownerId: number): Promise<Store[]>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: number, data: Partial<Store>): Promise<Store>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategoriesByStoreId(storeId: number): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, data: Partial<Category>): Promise<Category>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByStoreId(storeId: number): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(storeId: number, limit?: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<Product>): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Customer operations
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomersByStoreId(storeId: number): Promise<Customer[]>;
  getCustomerByEmail(email: string, storeId: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  // Cart operations
  getCart(id: number): Promise<Cart | undefined>;
  getCartBySessionId(sessionId: string): Promise<Cart | undefined>;
  getCartByCustomerId(customerId: number): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  deleteCart(id: number): Promise<boolean>;
  
  // Cart Item operations
  getCartItems(cartId: number): Promise<CartItem[]>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem>;
  removeCartItem(id: number): Promise<boolean>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByStoreId(storeId: number): Promise<Order[]>;
  getOrdersByCustomerId(customerId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  
  // Order Item operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Subscription Plan operations
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private otps: Map<number, OTP>;
  private stores: Map<number, Store>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private customers: Map<number, Customer>;
  private carts: Map<number, Cart>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private subscriptionPlans: Map<number, SubscriptionPlan>;
  
  private currentIds: {
    users: number;
    otps: number;
    stores: number;
    categories: number;
    products: number;
    customers: number;
    carts: number;
    cartItems: number;
    orders: number;
    orderItems: number;
    subscriptionPlans: number;
  };

  constructor() {
    this.users = new Map();
    this.otps = new Map();
    this.stores = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.customers = new Map();
    this.carts = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.subscriptionPlans = new Map();
    
    this.currentIds = {
      users: 1,
      otps: 1,
      stores: 1,
      categories: 1,
      products: 1,
      customers: 1,
      carts: 1,
      cartItems: 1,
      orders: 1,
      orderItems: 1,
      subscriptionPlans: 1,
    };

    // Initialize with subscription plans
    this.initSubscriptionPlans();
  }

  private initSubscriptionPlans() {
    const plans: InsertSubscriptionPlan[] = [
      {
        name: "basic",
        price: 29.99,
        features: ["Up to 100 products", "2% transaction fee", "Basic store customization", "Email support"],
        stripeProductId: "prod_basic",
        stripePriceId: "price_basic",
      },
      {
        name: "professional",
        price: 79.99,
        features: [
          "Up to 1,000 products",
          "1% transaction fee",
          "Advanced store customization",
          "Priority email support",
          "Analytics dashboard",
        ],
        stripeProductId: "prod_professional",
        stripePriceId: "price_professional",
      },
      {
        name: "enterprise",
        price: 199.99,
        features: [
          "Unlimited products",
          "0.5% transaction fee",
          "Full store customization",
          "24/7 phone & email support",
          "Advanced analytics & reporting",
          "Custom integrations",
        ],
        stripeProductId: "prod_enterprise",
        stripePriceId: "price_enterprise",
      },
    ];

    plans.forEach((plan) => {
      this.createSubscriptionPlan(plan);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phone === phone,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      isVerified: false,
      createdAt: now,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(id: number, data: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    const updatedUser = {
      ...user,
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // OTP operations
  async createOTP(insertOTP: InsertOTP): Promise<OTP> {
    const id = this.currentIds.otps++;
    const now = new Date();
    const otp: OTP = {
      ...insertOTP,
      id,
      isUsed: false,
      createdAt: now,
    };
    this.otps.set(id, otp);
    return otp;
  }

  async getOTPByUserId(userId: number): Promise<OTP | undefined> {
    return Array.from(this.otps.values()).find(
      (otp) => otp.userId === userId && !otp.isUsed && otp.expiresAt > new Date()
    );
  }

  async validateOTP(userId: number, otpCode: string): Promise<boolean> {
    const otp = await this.getOTPByUserId(userId);
    if (!otp) return false;
    
    return otp.otp === otpCode;
  }

  async markOTPAsUsed(id: number): Promise<OTP> {
    const otp = this.otps.get(id);
    if (!otp) {
      throw new Error(`OTP with ID ${id} not found`);
    }
    
    const updatedOTP = { ...otp, isUsed: true };
    this.otps.set(id, updatedOTP);
    return updatedOTP;
  }

  // Store operations
  async getStore(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async getStoreBySubdomain(subdomain: string): Promise<Store | undefined> {
    return Array.from(this.stores.values()).find(
      (store) => store.subdomain === subdomain,
    );
  }

  async getStoresByOwnerId(ownerId: number): Promise<Store[]> {
    return Array.from(this.stores.values()).filter(
      (store) => store.ownerId === ownerId,
    );
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const id = this.currentIds.stores++;
    const now = new Date();
    const store: Store = {
      ...insertStore,
      id,
      active: true,
      createdAt: now,
    };
    this.stores.set(id, store);
    return store;
  }

  async updateStore(id: number, data: Partial<Store>): Promise<Store> {
    const store = await this.getStore(id);
    if (!store) {
      throw new Error(`Store with ID ${id} not found`);
    }
    
    const updatedStore = { ...store, ...data };
    this.stores.set(id, updatedStore);
    return updatedStore;
  }

  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoriesByStoreId(storeId: number): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(
      (category) => category.storeId === storeId,
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentIds.categories++;
    const now = new Date();
    const category: Category = {
      ...insertCategory,
      id,
      createdAt: now,
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    const category = await this.getCategory(id);
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    
    const updatedCategory = { ...category, ...data };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    if (!this.categories.has(id)) {
      return false;
    }
    return this.categories.delete(id);
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByStoreId(storeId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.storeId === storeId,
    );
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId,
    );
  }

  async getFeaturedProducts(storeId: number, limit = 4): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter((product) => product.storeId === storeId && product.featured)
      .slice(0, limit);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentIds.products++;
    const now = new Date();
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: now,
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const product = await this.getProduct(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    const updatedProduct = { ...product, ...data };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    if (!this.products.has(id)) {
      return false;
    }
    return this.products.delete(id);
  }

  // Customer operations
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomersByStoreId(storeId: number): Promise<Customer[]> {
    return Array.from(this.customers.values()).filter(
      (customer) => customer.storeId === storeId,
    );
  }

  async getCustomerByEmail(email: string, storeId: number): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(
      (customer) => customer.email === email && customer.storeId === storeId,
    );
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentIds.customers++;
    const now = new Date();
    const customer: Customer = {
      ...insertCustomer,
      id,
      createdAt: now,
    };
    this.customers.set(id, customer);
    return customer;
  }

  // Cart operations
  async getCart(id: number): Promise<Cart | undefined> {
    return this.carts.get(id);
  }

  async getCartBySessionId(sessionId: string): Promise<Cart | undefined> {
    return Array.from(this.carts.values()).find(
      (cart) => cart.sessionId === sessionId,
    );
  }

  async getCartByCustomerId(customerId: number): Promise<Cart | undefined> {
    return Array.from(this.carts.values()).find(
      (cart) => cart.customerId === customerId,
    );
  }

  async createCart(insertCart: InsertCart): Promise<Cart> {
    const id = this.currentIds.carts++;
    const now = new Date();
    const cart: Cart = {
      ...insertCart,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.carts.set(id, cart);
    return cart;
  }

  async deleteCart(id: number): Promise<boolean> {
    if (!this.carts.has(id)) {
      return false;
    }
    return this.carts.delete(id);
  }

  // Cart Item operations
  async getCartItems(cartId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.cartId === cartId,
    );
  }

  async addCartItem(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if the item already exists in the cart
    const existingItem = Array.from(this.cartItems.values()).find(
      (item) => item.cartId === insertCartItem.cartId && item.productId === insertCartItem.productId,
    );
    
    if (existingItem) {
      // Update quantity instead of adding a new item
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + insertCartItem.quantity);
    }
    
    const id = this.currentIds.cartItems++;
    const now = new Date();
    const cartItem: CartItem = {
      ...insertCartItem,
      id,
      createdAt: now,
    };
    this.cartItems.set(id, cartItem);
    
    // Update cart updatedAt
    const cart = await this.getCart(insertCartItem.cartId);
    if (cart) {
      cart.updatedAt = now;
      this.carts.set(cart.id, cart);
    }
    
    return cartItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) {
      throw new Error(`Cart item with ID ${id} not found`);
    }
    
    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    
    // Update cart updatedAt
    const cart = await this.getCart(cartItem.cartId);
    if (cart) {
      cart.updatedAt = new Date();
      this.carts.set(cart.id, cart);
    }
    
    return updatedCartItem;
  }

  async removeCartItem(id: number): Promise<boolean> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) {
      return false;
    }
    
    // Update cart updatedAt
    const cart = await this.getCart(cartItem.cartId);
    if (cart) {
      cart.updatedAt = new Date();
      this.carts.set(cart.id, cart);
    }
    
    return this.cartItems.delete(id);
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByStoreId(storeId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.storeId === storeId,
    );
  }

  async getOrdersByCustomerId(customerId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.customerId === customerId,
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentIds.orders++;
    const now = new Date();
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: now,
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const order = await this.getOrder(id);
    if (!order) {
      throw new Error(`Order with ID ${id} not found`);
    }
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order Item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId,
    );
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentIds.orderItems++;
    const now = new Date();
    const orderItem: OrderItem = {
      ...insertOrderItem,
      id,
      createdAt: now,
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Subscription Plan operations
  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values());
  }

  async createSubscriptionPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = this.currentIds.subscriptionPlans++;
    const now = new Date();
    const plan: SubscriptionPlan = {
      ...insertPlan,
      id,
      createdAt: now,
    };
    this.subscriptionPlans.set(id, plan);
    return plan;
  }

  async updateSubscriptionPlan(id: number, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const plan = await this.getSubscriptionPlan(id);
    if (!plan) {
      throw new Error(`Subscription plan with ID ${id} not found`);
    }
    
    const updatedPlan = { ...plan, ...data };
    this.subscriptionPlans.set(id, updatedPlan);
    return updatedPlan;
  }
}

export const storage = new MemStorage();
