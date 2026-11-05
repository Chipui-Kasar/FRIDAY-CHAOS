import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const DEVICE_COOKIE = 'ff_device';
export const ADMIN_COOKIE = 'ff_admin';
const YEAR = 60 * 60 * 24 * 365;
const ADMIN_TTL = 60 * 60 * 8;

export const normalizeEmail = (raw: unknown): string | null => {
  if (typeof raw !== 'string') return null;
  const e = raw.trim().toLowerCase();
  return e.length > 3 && e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
};

/** 256-bit CSPRNG token, URL-safe. */
export const generateToken = () => randomBytes(32).toString('base64url');
export const sha256Hex = (s: string) => createHash('sha256').update(s).digest('hex');
export const isTokenShape = (t: string | undefined): t is string => !!t && /^[A-Za-z0-9_-]{43}$/.test(t);

const secure = () => process.env.NODE_ENV !== 'development';
const attrs = (extra: string) => `Path=/; HttpOnly; ${extra}${secure() ? '; Secure' : ''}`;

export const deviceCookie = (token: string) => `${DEVICE_COOKIE}=${token}; ${attrs(`SameSite=Lax; Max-Age=${YEAR}`)}`;
export const clearDeviceCookie = () => `${DEVICE_COOKIE}=; ${attrs('SameSite=Lax; Max-Age=0')}`;

export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get('cookie');
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return undefined;
}

export const clientIp = (req: Request) =>
  req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null;
export const userAgent = (req: Request) => req.headers.get('user-agent')?.slice(0, 300) ?? null;

// ---- admin session: HMAC-signed expiry, no DB state ----
const sign = (v: string) => createHmac('sha256', process.env.ADMIN_SESSION_SECRET ?? '').update(v).digest('base64url');
export const adminConfigured = () => !!process.env.ADMIN_PASSWORD && !!process.env.ADMIN_SESSION_SECRET;

export function safeEqual(a: string, b: string) {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}
export function adminCookie() {
  const exp = String(Math.floor(Date.now() / 1000) + ADMIN_TTL);
  return `${ADMIN_COOKIE}=${exp}.${sign(exp)}; ${attrs(`SameSite=Strict; Max-Age=${ADMIN_TTL}`)}`;
}
export function isAdmin(req: Request) {
  if (!adminConfigured()) return false;
  const v = readCookie(req, ADMIN_COOKIE);
  if (!v) return false;
  const [exp, sig] = v.split('.');
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, sign(exp));
}
