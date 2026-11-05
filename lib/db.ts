import { Pool, neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

export interface Queryable {
  query<T = any>(sql: string, params?: unknown[]): Promise<T[]>;
}
export interface Db extends Queryable {
  tx<T>(fn: (q: Queryable) => Promise<T>): Promise<T>;
  exec(sql: string): Promise<void>;
}

let current: Db | undefined;

/** Tests inject an in-process Postgres here. */
export function setDb(db: Db | undefined) {
  current = db;
}

export function getDb(): Db {
  if (current) return current;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  if (typeof WebSocket === 'undefined') neonConfig.webSocketConstructor = ws;
  // Reads/writes: stateless HTTP (one round trip, no connection handshake) — the fast path.
  const http = neon(url);
  // Transactions (rare: first-device registration only) need a real connection; created lazily.
  let pool: Pool | undefined;
  const getPool = () => (pool ??= new Pool({ connectionString: url }));
  current = {
    query: async (sql, params) => (await http.query(sql, params as any[])) as any[],
    exec: async (sql) => {
      await getPool().query(sql);
    },
    tx: async (fn) => {
      const c = await getPool().connect();
      try {
        await c.query('BEGIN');
        const r = await fn({ query: async (sql, params) => (await c.query(sql, params as any[])).rows });
        await c.query('COMMIT');
        return r;
      } catch (e) {
        await c.query('ROLLBACK').catch(() => {});
        throw e;
      } finally {
        c.release();
      }
    },
  };
  return current;
}
