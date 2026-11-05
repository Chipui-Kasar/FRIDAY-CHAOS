import { loadSession } from '../../../lib/access';
import { getDb } from '../../../lib/db';
import { DEVICE_COOKIE, readCookie } from '../../../lib/security';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Tiny poll target for the waiting room: one cheap query, no logging, never returns the assignment text. */
export async function GET(req: Request) {
  const s = await loadSession(getDb(), readCookie(req, DEVICE_COOKIE));
  return Response.json({ locked: s ? s.locked : true, signedIn: !!s }, { headers: { 'cache-control': 'no-store' } });
}
