import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import * as schema from './schema.ts';

dotenv.config({ override: true });

declare global {
  var _postgresPool: Pool | undefined;
}

export function cleanConnectionString(url: string): string {
  let cleaned = (url || '').trim();
  if (cleaned.includes(':[') && cleaned.includes(']@')) {
    cleaned = cleaned.replace(':[', ':').replace(']@', '@');
  }
  // Auto-redirect Supabase direct host to port 6543 if port 5432 is specified
  if (cleaned.includes('db.wkaduojflufgffthbfuo.supabase.co:5432')) {
    cleaned = cleaned.replace('db.wkaduojflufgffthbfuo.supabase.co:5432', 'db.wkaduojflufgffthbfuo.supabase.co:6543');
  }
  return cleaned;
}

export function getValidConnectionString(): string {
  const candidates = [
    process.env.SUPABASE_DATABASE_URL,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
  ];
  for (const raw of candidates) {
    if (!raw) continue;
    const cleaned = cleanConnectionString(raw);
    if (
      cleaned.startsWith('postgres') &&
      !cleaned.includes('YOUR-PASSWORD') &&
      !cleaned.includes('YOUR_SUPABASE_DB_PASSWORD') &&
      !cleaned.includes('[YOUR_') &&
      !cleaned.includes('YOUR_PASSWORD')
    ) {
      return cleaned;
    }
  }
  return 'postgresql://postgres:RsI6W0Zrw6ZlOC7L@db.wkaduojflufgffthbfuo.supabase.co:6543/postgres';
}

export const createPool = (): Pool => {
  if (!global._postgresPool) {
    const connectionString = getValidConnectionString();

    if (connectionString.length > 0) {
      const isCloud =
        connectionString.includes('supabase') ||
        connectionString.includes('sslmode=require') ||
        process.env.NODE_ENV === 'production';

      global._postgresPool = new Pool({
        connectionString,
        max: 15,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        ssl: isCloud ? { rejectUnauthorized: false } : undefined,
      });
    } else {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST || 'localhost',
        user: process.env.SQL_USER || 'postgres',
        password: process.env.SQL_PASSWORD || 'postgres',
        database: process.env.SQL_DB_NAME || 'postgres',
        port: Number(process.env.SQL_PORT) || 5432,
        max: 10,
        connectionTimeoutMillis: 10000,
      });
    }

    global._postgresPool.on('error', (err) => {
      console.warn('[PostgreSQL Pool Warning]:', err.message);
    });
  }
  return global._postgresPool;
};

export const pool = createPool();
export const db = drizzle(pool, { schema });
