import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  json,
  timestamp,
  uniqueIndex,
  foreignKey,
  numeric,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    isVerified: boolean("is_verified").default(false),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    role: text("role").default("store_owner").notNull(), // store_owner, customer
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// OTP
export const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Stores
export const stores = pgTable(
  "stores",
  {
    id: serial("id").primaryKey(),
    ownerId: integer("owner_id")
      .references(() => users.id)
      .notNull(),
    name: text("name").notNull(),
    subdomain: text("subdomain").notNull().unique(),
    description: text("description"),
    logo: text("logo"),
    theme: json("theme").$type<{
      primaryColor: string;
      secondaryColor: string;
      fontFamily: string;
    }>(),
    active: boolean("active").default(true),
    plan: text("plan").default("basic"), // basic, professional, enterprise
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// Categories
export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    storeId: integer("store_id")
      .references(() => stores.id)
      .notNull(),
    name: text("name").notNull(),
    description: text("description"),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// Products
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    storeId: integer("store_id")
      .references(() => stores.id)
      .notNull(),
    categoryId: integer("category_id").references(() => categories.id),
    name: text("name").notNull(),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
    images: text("images").array(),
    inventory: integer("inventory").default(0),
    sku: text("sku"),
    active: boolean("active").default(true),
    featured: boolean("featured").default(false),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// Customers
export const customers = pgTable(
  "customers",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    storeId: integer("store_id")
      .references(() => stores.id)
      .notNull(),
    name: text("name"),
    email: text("email").notNull(),
    phone: text("phone"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// Carts
export const carts = pgTable(
  "carts",
  {
    id: serial("id").primaryKey(),
    storeId: integer("store_id")
      .references(() => stores.id)
      .notNull(),
    customerId: integer("customer_id").references(() => customers.id),
    sessionId: text("session_id"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
);

// Cart Items
export const cartItems = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    cartId: integer("cart_id")
      .references(() => carts.id)
      .notNull(),
    productId: integer("product_id")
      .references(() => products.id)
      .notNull(),
    quantity: integer("quantity").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// Orders
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    storeId: integer("store_id")
      .references(() => stores.id)
      .notNull(),
    customerId: integer("customer_id").references(() => customers.id),
    status: text("status").default("pending").notNull(), // pending, processing, shipped, delivered, cancelled
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    shippingAddress: json("shipping_address").$type<{
      address: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    }>(),
    paymentMethod: text("payment_method").default("stripe"),
    paymentId: text("payment_id"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// Order Items
export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .references(() => orders.id)
      .notNull(),
    productId: integer("product_id")
      .references(() => products.id)
      .notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// Subscription Plans
export const subscriptionPlans = pgTable(
  "subscription_plans",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(), // basic, professional, enterprise
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    features: text("features").array(),
    stripeProductId: text("stripe_product_id"),
    stripePriceId: text("stripe_price_id"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// Schema Validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
  role: true,
});

export const insertOtpSchema = createInsertSchema(otps).pick({
  userId: true,
  otp: true,
  expiresAt: true,
});

export const insertStoreSchema = createInsertSchema(stores).pick({
  ownerId: true,
  name: true,
  subdomain: true,
  description: true,
  logo: true,
  theme: true,
  plan: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  storeId: true,
  name: true,
  description: true,
  image: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  storeId: true,
  categoryId: true,
  name: true,
  description: true,
  price: true,
  compareAtPrice: true,
  images: true,
  inventory: true,
  sku: true,
  active: true,
  featured: true,
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  userId: true,
  storeId: true,
  name: true,
  email: true,
  phone: true,
});

export const insertCartSchema = createInsertSchema(carts).pick({
  storeId: true,
  customerId: true,
  sessionId: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  cartId: true,
  productId: true,
  quantity: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  storeId: true,
  customerId: true,
  status: true,
  total: true,
  shippingAddress: true,
  paymentMethod: true,
  paymentId: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  price: true,
  quantity: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).pick({
  name: true,
  price: true,
  features: true,
  stripeProductId: true,
  stripePriceId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type OTP = typeof otps.$inferSelect;
export type InsertOTP = z.infer<typeof insertOtpSchema>;

export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Cart = typeof carts.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

// Extended validation schemas for registration and login
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  storeName: z.string().min(3, "Store name must be at least 3 characters"),
  subdomain: z.string()
    .min(3, "Subdomain must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
});


export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
});

export const otpVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});
