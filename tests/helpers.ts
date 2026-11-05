import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { setDb, type Db } from '@/lib/db';
import {
  handleAccess, handleAdminLogin, handleAdminLogs, handleAdminOverview, handleAdminReset, handleAdminRevoke,
  handleAssignment, handleAdminSettings, handleAdminReveal,
} from '@/lib/handlers';

export const A = { name: 'Ada', email: 'ada@example.com', assignment: 'ASSIGNMENT-FOR-ADA' };
export const B = { name: 'Bob', email: 'bob@example.com', assignment: 'ASSIGNMENT-FOR-BOB' };

export async function freshDb(opts: { revealOpen?: boolean } = {}) {
  const pg = new PGlite();
  const db: Db = {
    query: async (s, p) => (await pg.query(s, p as any[])).rows as any,
    exec: async (s) => void (await pg.exec(s)),
    tx: (fn) => pg.transaction((t) => fn({ query: async (s, p) => (await t.query(s, p as any[])).rows as any })),
  };
  await db.exec(readFileSync('db/schema.sql', 'utf8'));
  for (const u of [A, B]) {
    const [p] = await db.query<{ id: string }>(`INSERT INTO participants (name,email) VALUES ($1,$2) RETURNING id`, [u.name, u.email]);
    await db.query(`INSERT INTO assignments (participant_id, content) VALUES ($1,$2)`, [p.id, u.assignment]);
  }
  await db.query(`UPDATE game_settings SET reveal_open = $1`, [opts.revealOpen ?? true]);
  setDb(db);
  process.env.ADMIN_PASSWORD = 'host-pass';
  process.env.ADMIN_SESSION_SECRET = 'test-secret';
  return db;
}

export const idOf = async (db: Db, email: string) =>
  (await db.query<{ id: string }>(`SELECT id FROM participants WHERE email=$1`, [email]))[0].id;

/** A simulated browser: owns a cookie jar. localStorage is irrelevant to the server, so it isn't modelled. */
export class Browser {
  jar = new Map<string, string>();
  constructor(public ip = '10.0.0.1') {}
  async call(handler: (r: Request) => Promise<Response>, path: string, init: { method?: string; body?: unknown; headers?: Record<string, string> } = {}) {
    const headers: Record<string, string> = { 'x-forwarded-for': this.ip, 'user-agent': 'vitest', ...init.headers };
    if (this.jar.size) headers.cookie = [...this.jar].map(([k, v]) => `${k}=${v}`).join('; ');
    if (init.body !== undefined) headers['content-type'] ??= 'application/json';
    const res = await handler(new Request(`http://localhost${path}`, {
      method: init.method ?? (init.body ? 'POST' : 'GET'), headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    }));
    const raw = res.headers.getSetCookie();
    for (const c of raw) {
      const [kv] = c.split(';');
      const i = kv.indexOf('=');
      const v = kv.slice(i + 1);
      v ? this.jar.set(kv.slice(0, i), v) : this.jar.delete(kv.slice(0, i));
    }
    return { status: res.status, json: (await res.json()) as any, setCookie: raw };
  }
  access = (email: string) => this.call(handleAccess, '/api/access', { body: { email } });
  assignment = (path = '/api/assignment', headers?: Record<string, string>) => this.call(handleAssignment, path, { headers });
  adminLogin = (password = 'host-pass') => this.call(handleAdminLogin, '/api/admin/login', { body: { password } });
  overview = () => this.call(handleAdminOverview, '/api/admin/overview');
  settings = (body: unknown) => this.call(handleAdminSettings, '/api/admin/settings', { body });
  revealPerson = (participantId: string, revealed = true) => this.call(handleAdminReveal, '/api/admin/reveal', { body: { participantId, revealed } });
  logs = () => this.call(handleAdminLogs, '/api/admin/logs');
  reset = (participantId: string) => this.call(handleAdminReset, '/api/admin/reset', { body: { participantId } });
  revoke = (participantId: string) => this.call(handleAdminRevoke, '/api/admin/revoke', { body: { participantId } });
}
