import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import dotenv from 'dotenv';
dotenv.config();

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;
neonConfig.wsProxy = (url) => url; // Add this line to prevent proxy issues

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Add connection retry logic
const createPool = (retries = 5, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return new Pool({ 
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 5000, // 5 second timeout
        max: 20 // Limit pool size
      });
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        console.warn(`Database connection attempt ${i + 1} failed, retrying in ${delay}ms...`);
        // Sleep for delay milliseconds
        new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

export const pool = createPool();
export const db = drizzle(pool, { schema });