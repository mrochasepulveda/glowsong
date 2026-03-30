import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';
import { config } from '../config/env.js';

const pool = new pg.Pool({
  connectionString: config.database.url,
  ssl: config.nodeEnv === 'production' || config.database.url.includes('supabase.co')
    ? { rejectUnauthorized: false }
    : undefined,
});

export const db = drizzle(pool, { schema });
export type Database = typeof db;
