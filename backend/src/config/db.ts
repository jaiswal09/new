import { Pool } from 'pg';
import { neon, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Set Neon config
neonConfig.fetchConnectionCache = true;

let pool: Pool | null = null;

// Function to get or create a database connection
export const getDbConnection = () => {
  if (!pool) {
    // Check for serverless environment
    if (process.env.NODE_ENV === 'production') {
      // For production, use Neon serverless
      const sql = neon(process.env.DATABASE_URL!);
      
      // Return a proxy object that implements the Pool interface but uses neon
      return {
        query: async (text: string, params?: any[]) => {
          console.log('Executing query via Neon:', { text, params });
          try {
            const result = await sql`${text}`;
            return {
              rows: result,
              rowCount: result.length,
            };
          } catch (error) {
            console.error('Database query error:', error);
            throw error;
          }
        },
        // Add minimal required Pool methods
        connect: async () => {
          throw new Error('Direct connection not available in serverless mode');
        },
        end: async () => {
          // No action needed for serverless
          console.log('Pool end called (no-op in serverless)');
        },
      };
    } else {
      // For development, use traditional Pool
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
      });

      console.log('PostgreSQL pool created');
    }
  }

  return pool;
};

// Function to initialize the database schema
export const initializeDatabase = async () => {
  const db = getDbConnection();
  try {
    // Read and execute schema file - in a real app, you'd want to use a migration tool
    // This is a simplified approach for this example
    const fs = require('fs');
    const path = require('path');
    const schema = fs.readFileSync(
      path.join(__dirname, 'db.schema.sql'), 
      'utf8'
    );
    
    // Split the schema into individual statements to execute separately
    const statements = schema.split(';').filter((statement: string) => statement.trim());
    
    for (const statement of statements) {
      await db.query(statement + ';');
    }
    
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
};

export default getDbConnection;
