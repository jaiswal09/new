import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

export const connectDB = async () => {
  try {
    await pool.connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    // Don't exit process in development to allow app to run without DB
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    } else {
      console.log("Running in development mode without database connection");
    }
  }
};

export default pool;