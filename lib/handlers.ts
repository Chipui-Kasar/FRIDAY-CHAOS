import {
  adminLogs, adminOverview, authenticateDevice, loadSession, logEvent, rateLimit, registerDevice,
  resetDeviceAccess, revokeDeviceAccess, type Meta,
} from './access';
import { getDb } from './db';
import {
  ADMIN_COOKIE, DEVICE_COOKIE, adminConfigured, adminCookie, clientIp, deviceCookie, isAdmin, normalizeEmail,
  readCookie, safeEqual, sha256Hex, userAgent,
} from './security';

export const LOCKED_MESSAGE =
  'This assignment has already been opened on another device. Contact the game host if you need access restored.';
export const UNAVAILABLE_MESSAGE = 'Access not available.';
const RATE_MESSAGE = 'Too many attempts. Please wait a few minutes and try again.';

export const LIMITS = { ipPerWindow: 30, emailPerWindow: 10, adminPerWindow: 10, windowSec: 600 };

function json(body: unknown, status = 200, cookies: string[] = []) {
  const h = new Headers({ 'content-type': 'application/json', 'cache-control': 'no-store' });
  cookies.forEach((c) => h.append('set-cookie', c));
  return new Response(JSON.stringify(body), { status, headers: h });
}
const meta = (req: Request): Meta => ({ ip: clientIp(req), userAgent: userAgent(req) });

/** Mutating routes must be JSON: a cross-site <form> can't send that without a CORS preflight (CSRF defence). */
async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return null;
  try {
    const b = await req.json();
    return b && typeof b === 'object' ? (b as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

// ---------- participant ----------

/** POST /api/access  { email }  — first-device registration (or resume on the registered device). */
export async function handleAccess(req: Request) {
  const db = getDb();
  const m = meta(req);
  const body = await readJson(req);
  if (!body) return json({ error: 'Bad request.' }, 400);
  const email = normalizeEmail(body.email);
  if (!email) return json({ error: UNAVAILABLE_MESSAGE }, 403);

  const okIp = await rateLimit(db, `access:ip:${m.ip ?? 'unknown'}`, LIMITS.ipPerWindow, LIMITS.windowSec);
  const okEmail = await rateLimit(db, `access:email:${sha256Hex(email)}`, LIMITS.emailPerWindow, LIMITS.windowSec);
  if (!okIp || !okEmail) {
    await logEvent(db, { email, event: 'register', success: false, detail: 'rate_limited' }, m);
    return json({ error: RATE_MESSAGE }, 429);
  }

  // Already-registered device re-entering its own email: just resume.
  const current = await authenticateDevice(db, readCookie(req, DEVICE_COOKIE));
  if (current) {
    if (current.email === email) return json({ ok: true, name: current.name });
    // A device already bound to someone else may not claim a second identity.
    await logEvent(db, { participantId: current.id, email, event: 'register', success: false, detail: 'device_bound_to_other' }, m);
    return json({ error: UNAVAILABLE_MESSAGE }, 403);
  }

  const r = await registerDevice(db, email, m);
  if (r.status === 'registered') return json({ ok: true, name: r.participant.name }, 200, [deviceCookie(r.token)]);
  if (r.status === 'locked') return json({ code: 'DEVICE_LOCKED', error: LOCKED_MESSAGE }, 403);
  return json({ error: UNAVAILABLE_MESSAGE }, 403);
}

/** GET /api/assignment — identity comes ONLY from the HttpOnly cookie. No id/email input is read. */
export async function handleAssignment(req: Request) {
  const db = getDb();
  const s = await loadSession(db, readCookie(req, DEVICE_COOKIE));
  if (!s) {
    await logEvent(db, { event: 'view_assignment', success: false, detail: 'no_valid_device' }, meta(req));
    return json({ error: 'Not signed in on this device.' }, 401);
  }
  await logEvent(db, { participantId: s.participant.id, event: 'view_assignment', success: true }, meta(req));
  return json({ name: s.participant.name, assignment: s.assignment });
}

// ---------- admin ----------

function adminGuard(req: Request): Response | null {
  if (!adminConfigured()) return json({ error: 'Admin is not configured.' }, 503);
  return isAdmin(req) ? null : json({ error: 'Unauthorized.' }, 401);
}

export async function handleAdminLogin(req: Request) {
  if (!adminConfigured()) return json({ error: 'Admin is not configured.' }, 503);
  const db = getDb();
  const m = meta(req);
  if (!(await rateLimit(db, `admin:ip:${m.ip ?? 'unknown'}`, LIMITS.adminPerWindow, LIMITS.windowSec)))
    return json({ error: RATE_MESSAGE }, 429);
  const body = await readJson(req);
  const pw = typeof body?.password === 'string' ? body.password : '';
  const ok = safeEqual(pw, process.env.ADMIN_PASSWORD!);
  await logEvent(db, { event: 'admin_login', success: ok }, m);
  return ok ? json({ ok: true }, 200, [adminCookie()]) : json({ error: 'Incorrect password.' }, 401);
}

export async function handleAdminOverview(req: Request) {
  return adminGuard(req) ?? json({ participants: await adminOverview(getDb()) });
}

export async function handleAdminLogs(req: Request) {
  const denied = adminGuard(req);
  if (denied) return denied;
  const pid = new URL(req.url).searchParams.get('participantId');
  const valid = pid && /^[0-9a-f-]{36}$/i.test(pid) ? pid : null;
  return json({ logs: await adminLogs(getDb(), valid) });
}

async function adminAction(req: Request, fn: typeof resetDeviceAccess) {
  const denied = adminGuard(req);
  if (denied) return denied;
  const body = await readJson(req);
  const id = typeof body?.participantId === 'string' && /^[0-9a-f-]{36}$/i.test(body.participantId) ? body.participantId : null;
  if (!id) return json({ error: 'Bad request.' }, 400);
  const changed = await fn(getDb(), id, meta(req));
  return json({ ok: true, changed });
}
export const handleAdminReset = (req: Request) => adminAction(req, resetDeviceAccess);
export const handleAdminRevoke = (req: Request) => adminAction(req, revokeDeviceAccess);

export { ADMIN_COOKIE };
