// import { drizzle } from 'drizzle-orm/neon-http';

// if (!process.env.DATABASE_URL) {
//   throw new Error('DATABASE_URL is not defined in the environment variables');
// }

// export const db = drizzle(process.env.DATABASE_URL);

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const pg = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: pg });
