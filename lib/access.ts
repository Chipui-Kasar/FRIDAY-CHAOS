import type { Db, Queryable } from './db';
import { generateToken, isTokenShape, sha256Hex } from './security';

export type Meta = { ip: string | null; userAgent: string | null };
export type Participant = { id: string; name: string; email: string };

export async function logEvent(
  q: Queryable,
  e: { participantId?: string | null; email?: string | null; event: string; success: boolean; detail?: string },
  meta: Meta,
) {
  await q.query(
    `INSERT INTO access_logs (participant_id, email_attempted, event, success, detail, ip_address, user_agent)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [e.participantId ?? null, e.email ?? null, e.event, e.success, e.detail ?? null, meta.ip, meta.userAgent],
  );
}

/** Fixed-window counter. Returns true if the call is allowed. */
export async function rateLimit(db: Db, key: string, limit: number, windowSec: number): Promise<boolean> {
  const rows = await db.query<{ count: number }>(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES ($1, to_timestamp(floor(extract(epoch from now()) / $2::int) * $2::int), 1)
     ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limits.count + 1
     RETURNING count`,
    [key, windowSec],
  );
  if (Math.random() < 0.02) await db.query(`DELETE FROM rate_limits WHERE window_start < now() - interval '1 day'`);
  return Number(rows[0].count) <= limit;
}

/** Resolve the HttpOnly device token to the participant that owns it. This is the ONLY authorization path. */
export async function authenticateDevice(db: Db, token: string | undefined): Promise<Participant | null> {
  if (!isTokenShape(token)) return null;
  const rows = await db.query<Participant>(
    `UPDATE participant_device_access a SET last_accessed_at = now()
       FROM participants p
      WHERE a.participant_id = p.id AND a.device_token_hash = $1
        AND a.revoked_at IS NULL AND p.is_active
      RETURNING p.id, p.name, p.email`,
    [sha256Hex(token)],
  );
  return rows[0] ?? null;
}

export type RegisterResult =
  | { status: 'registered'; token: string; participant: Participant }
  | { status: 'unavailable' }
  | { status: 'locked'; participant: Participant };

/**
 * Atomic first-device claim. The UNIQUE(participant_id) constraint plus a conditional upsert means that
 * of any number of concurrent requests, at most one can win; the rest see zero rows and are denied.
 * A revoked row can be re-claimed only if an admin reset it (reset_allowed).
 */
export async function registerDevice(db: Db, email: string, meta: Meta): Promise<RegisterResult> {
  const token = generateToken();
  const hash = sha256Hex(token);
  return db.tx(async (q) => {
    const [p] = await q.query<Participant>(
      `SELECT id, name, email FROM participants WHERE email = $1 AND is_active`,
      [email],
    );
    if (!p) {
      await logEvent(q, { email, event: 'register', success: false, detail: 'not_registered' }, meta);
      return { status: 'unavailable' };
    }
    const won = await q.query(
      `INSERT INTO participant_device_access (participant_id, device_token_hash, user_agent, ip_address)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (participant_id) DO UPDATE SET
         device_token_hash = EXCLUDED.device_token_hash, created_at = now(), last_accessed_at = now(),
         revoked_at = NULL, reset_allowed = FALSE,
         user_agent = EXCLUDED.user_agent, ip_address = EXCLUDED.ip_address
       WHERE participant_device_access.revoked_at IS NOT NULL AND participant_device_access.reset_allowed
       RETURNING id`,
      [p.id, hash, meta.userAgent, meta.ip],
    );
    if (won.length === 0) {
      await logEvent(q, { participantId: p.id, email, event: 'register', success: false, detail: 'already_claimed' }, meta);
      return { status: 'locked', participant: p };
    }
    await q.query(
      `UPDATE assignments SET claimed_at = COALESCE(claimed_at, now()),
              claimed_participant_id = COALESCE(claimed_participant_id, participant_id)
        WHERE participant_id = $1`,
      [p.id],
    );
    await logEvent(q, { participantId: p.id, email, event: 'register', success: true }, meta);
    return { status: 'registered', token, participant: p };
  });
}

export async function getAssignment(db: Db, participantId: string): Promise<string | null> {
  const rows = await db.query<{ content: string }>(`SELECT content FROM assignments WHERE participant_id = $1`, [
    participantId,
  ]);
  return rows[0]?.content ?? null;
}

// ---- admin actions ----
export async function resetDeviceAccess(db: Db, participantId: string, meta: Meta) {
  return db.tx(async (q) => {
    const rows = await q.query(
      `UPDATE participant_device_access SET revoked_at = COALESCE(revoked_at, now()), reset_allowed = TRUE
        WHERE participant_id = $1 RETURNING id`,
      [participantId],
    );
    await logEvent(q, { participantId, event: 'admin_reset', success: rows.length > 0 }, meta);
    return rows.length > 0;
  });
}

export async function revokeDeviceAccess(db: Db, participantId: string, meta: Meta) {
  return db.tx(async (q) => {
    const rows = await q.query(
      `UPDATE participant_device_access SET revoked_at = COALESCE(revoked_at, now()), reset_allowed = FALSE
        WHERE participant_id = $1 RETURNING id`,
      [participantId],
    );
    await logEvent(q, { participantId, event: 'admin_revoke', success: rows.length > 0 }, meta);
    return rows.length > 0;
  });
}

export async function adminOverview(db: Db) {
  return db.query(
    `SELECT p.id, p.name, p.email,
            a.claimed_at,
            d.created_at AS registered_at, d.last_accessed_at, d.revoked_at, d.user_agent, d.ip_address,
            CASE WHEN d.id IS NULL THEN 'unclaimed'
                 WHEN d.revoked_at IS NULL THEN 'active'
                 WHEN d.reset_allowed THEN 'reset_pending'
                 ELSE 'revoked' END AS status
       FROM participants p
       LEFT JOIN assignments a ON a.participant_id = p.id
       LEFT JOIN participant_device_access d ON d.participant_id = p.id
      WHERE p.is_active
      ORDER BY p.name`,
  );
}

export async function adminLogs(db: Db, participantId: string | null, limit = 200) {
  return db.query(
    `SELECT l.id, l.created_at, l.event, l.success, l.detail, l.email_attempted, l.ip_address, l.user_agent,
            p.name AS participant_name
       FROM access_logs l LEFT JOIN participants p ON p.id = l.participant_id
      WHERE ($1::uuid IS NULL OR l.participant_id = $1::uuid)
      ORDER BY l.created_at DESC LIMIT $2`,
    [participantId, limit],
  );
}
