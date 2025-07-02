import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

console.log("Database connection - DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in the environment variables');
}

const pg = neon(process.env.DATABASE_URL);
export const db = drizzle({ client: pg });

// Test connection function
export const connectDB = async () => {
  try {
    console.log("Testing database connection...");
    await pg`SELECT 1`;
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};