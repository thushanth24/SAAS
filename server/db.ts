import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import dotenv from 'dotenv';
dotenv.config();

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Remove the wsProxy configuration as we're using direct connection
// neonConfig.wsProxy = (url) => url;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Sleep helper function
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Add connection retry logic with exponential backoff
const createPool = async (maxRetries = 5, initialDelay = 1000) => {
  let lastError;
  let delay = initialDelay;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const pool = new Pool({ 
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 10000, // Increased timeout to 10 seconds
        max: 20 // Limit pool size
      });
      
      // Test the connection
      await pool.connect();
      console.log('Database connection established successfully');
      return pool;
    } catch (error) {
      lastError = error;
      console.error(`Database connection attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        console.warn(`Retrying in ${delay}ms...`);
        await sleep(delay);
        // Exponential backoff with jitter
        delay = Math.min(delay * 1.5, 10000) * (0.9 + Math.random() * 0.2);
      }
    }
  }
  
  throw new Error(`Failed to connect to database after ${maxRetries} attempts: ${lastError?.message}`);
};

// Initialize pool and db with proper error handling
let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
  pool = await createPool();
  db = drizzle(pool, { schema });
} catch (error) {
  console.error('Fatal: Failed to initialize database connection:', error);
  throw error;
}

export { pool, db };