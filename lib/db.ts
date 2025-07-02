import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Check environment variable
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in environment variables');
  throw new Error('DATABASE_URL is not defined');
}

console.log("Database connection - DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");

const pg = neon(process.env.DATABASE_URL);
export const db = drizzle({ client: pg });

// Define users table schema
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull(),
  department: text('department'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Test database connection
export const testConnection = async () => {
  try {
    console.log("Testing database connection...");
    const result = await pg`SELECT 1 as test`;
    console.log("Database connection successful:", result);
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
};

// Create tables if they don't exist
export const initializeDatabase = async () => {
  try {
    console.log("Initializing database tables...");
    
    // Create users table
    await pg`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        department TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    console.log("Database tables initialized successfully");
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false;
  }
};