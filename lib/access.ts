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

/** Fixed-window counters for several keys in ONE round trip. Returns true if every key is within its limit. */
export async function rateLimitMany(db: Db, checks: { key: string; limit: number }[], windowSec: number): Promise<boolean> {
  const rows = await db.query<{ key: string; count: number }>(
    `INSERT INTO rate_limits (key, window_start, count)
     SELECT k, to_timestamp(floor(extract(epoch from now()) / $2::int) * $2::int), 1 FROM unnest($1::text[]) AS k
     ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limits.count + 1
     RETURNING key, count`,
    [checks.map((c) => c.key), windowSec],
  );
  if (Math.random() < 0.02) await db.query(`DELETE FROM rate_limits WHERE window_start < now() - interval '1 day'`);
  const counts = new Map(rows.map((r) => [r.key, Number(r.count)]));
  return checks.every((c) => (counts.get(c.key) ?? 0) <= c.limit);
}
export const rateLimit = (db: Db, key: string, limit: number, windowSec: number) => rateLimitMany(db, [{ key, limit }], windowSec);

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

export type Session = {
  participant: Participant;
  /** null while the reveal is locked: the text is never even read from the table until the host opens it. */
  assignment: string | null;
  locked: boolean;
  revealAtMs: number | null;
  serverNowMs: number;
};

/**
 * Hot path: authenticate the device, check the reveal switch, and fetch the assignment in ONE round trip.
 * last_accessed_at is only written when stale (>1 min) so most page views are read-only.
 */
export async function loadSession(db: Db, token: string | undefined): Promise<Session | null> {
  if (!isTokenShape(token)) return null;
  const rows = await db.query<any>(
    `WITH me AS (
       SELECT a.id AS access_id, p.id, p.name, p.email, (s.revealed_at IS NOT NULL) AS own_open
         FROM participant_device_access a JOIN participants p ON p.id = a.participant_id
         LEFT JOIN assignments s ON s.participant_id = p.id
        WHERE a.device_token_hash = $1 AND a.revoked_at IS NULL AND p.is_active),
     touch AS (
       UPDATE participant_device_access d SET last_accessed_at = now() FROM me
        WHERE d.id = me.access_id AND d.last_accessed_at < now() - interval '1 minute' RETURNING d.id),
     cfg AS (
       SELECT (reveal_open OR (reveal_at IS NOT NULL AND reveal_at <= now())) AS is_open,
              (extract(epoch FROM reveal_at) * 1000)::bigint AS reveal_at_ms,
              (extract(epoch FROM now()) * 1000)::bigint AS now_ms
         FROM game_settings WHERE id = 1)
     SELECT me.id, me.name, me.email, (cfg.is_open OR me.own_open) AS is_open, cfg.reveal_at_ms, cfg.now_ms,
            CASE WHEN (cfg.is_open OR me.own_open) THEN (SELECT content FROM assignments WHERE participant_id = me.id) END AS assignment
       FROM me CROSS JOIN cfg`,
    [sha256Hex(token)],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    participant: { id: r.id, name: r.name, email: r.email },
    assignment: r.is_open ? r.assignment ?? null : null,
    locked: !r.is_open,
    revealAtMs: r.reveal_at_ms == null ? null : Number(r.reveal_at_ms),
    serverNowMs: Number(r.now_ms),
  };
}

export type RegisterResult =
  | { status: 'registered'; token: string; participant: Participant }
  | { status: 'unavailable' }
  | { status: 'locked'; participant: Participant };

/**
 * Atomic first-device claim in ONE statement (= one implicit transaction, one round trip).
 * UNIQUE(participant_id) + the conditional upsert mean that of any number of concurrent requests at most one
 * can win; the rest see zero rows and are denied. A revoked row can be re-claimed only after an admin reset.
 */
export async function registerDevice(db: Db, email: string, meta: Meta): Promise<RegisterResult> {
  const token = generateToken();
  const rows = await db.query<{ id: string | null; name: string | null; email: string | null; won: boolean }>(
    `WITH p AS (SELECT id, name, email FROM participants WHERE email = $1 AND is_active),
          ins AS (
            INSERT INTO participant_device_access (participant_id, device_token_hash, user_agent, ip_address)
            SELECT id, $2, $3, $4 FROM p
            ON CONFLICT (participant_id) DO UPDATE SET
              device_token_hash = EXCLUDED.device_token_hash, created_at = now(), last_accessed_at = now(),
              revoked_at = NULL, reset_allowed = FALSE,
              user_agent = EXCLUDED.user_agent, ip_address = EXCLUDED.ip_address
            WHERE participant_device_access.revoked_at IS NOT NULL AND participant_device_access.reset_allowed
            RETURNING participant_id),
          clm AS (
            UPDATE assignments SET claimed_at = COALESCE(claimed_at, now()),
                   claimed_participant_id = COALESCE(claimed_participant_id, participant_id)
             WHERE participant_id IN (SELECT participant_id FROM ins) RETURNING 1),
          lg AS (
            INSERT INTO access_logs (participant_id, email_attempted, event, success, detail, ip_address, user_agent)
            SELECT (SELECT id FROM p), $1, 'register', EXISTS (SELECT 1 FROM ins),
                   CASE WHEN NOT EXISTS (SELECT 1 FROM p) THEN 'not_registered'
                        WHEN NOT EXISTS (SELECT 1 FROM ins) THEN 'already_claimed' END, $4, $3)
     SELECT (SELECT id FROM p) AS id, (SELECT name FROM p) AS name, (SELECT email FROM p) AS email,
            EXISTS (SELECT 1 FROM ins) AS won`,
    [email, sha256Hex(token), meta.userAgent, meta.ip],
  );
  const r = rows[0];
  if (!r?.id) return { status: 'unavailable' };
  const participant = { id: r.id, name: r.name!, email: r.email! };
  return r.won ? { status: 'registered', token, participant } : { status: 'locked', participant };
}

// ---- admin actions (each is ONE statement: change + audit log, one round trip) ----
async function changeAndLog(db: Db, event: string, participantId: string, set: string, meta: Meta): Promise<boolean> {
  const [r] = await db.query<{ n: number }>(
    `WITH u AS (UPDATE participant_device_access SET ${set} WHERE participant_id = $1 RETURNING id),
          l AS (INSERT INTO access_logs (participant_id, event, success, ip_address, user_agent)
                VALUES ($1, $2, EXISTS (SELECT 1 FROM u), $3, $4))
     SELECT count(*)::int AS n FROM u`,
    [participantId, event, meta.ip, meta.userAgent],
  );
  return Number(r.n) > 0;
}
export const resetDeviceAccess = (db: Db, id: string, meta: Meta) =>
  changeAndLog(db, 'admin_reset', id, 'revoked_at = COALESCE(revoked_at, now()), reset_allowed = TRUE', meta);
export const revokeDeviceAccess = (db: Db, id: string, meta: Meta) =>
  changeAndLog(db, 'admin_revoke', id, 'revoked_at = COALESCE(revoked_at, now()), reset_allowed = FALSE', meta);

export async function adminOverview(db: Db) {
  return db.query(
    `SELECT p.id, p.name, p.email,
            a.claimed_at, a.revealed_at,
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

// ---- reveal switch ----
export type Settings = { revealOpen: boolean; isOpen: boolean; revealAtMs: number | null; serverNowMs: number };

export async function getSettings(db: Db): Promise<Settings> {
  const [r] = await db.query<any>(
    `SELECT reveal_open, (reveal_open OR (reveal_at IS NOT NULL AND reveal_at <= now())) AS is_open,
            (extract(epoch FROM reveal_at) * 1000)::bigint AS reveal_at_ms,
            (extract(epoch FROM now()) * 1000)::bigint AS now_ms
       FROM game_settings WHERE id = 1`,
  );
  return { revealOpen: r.reveal_open, isOpen: r.is_open, revealAtMs: r.reveal_at_ms == null ? null : Number(r.reveal_at_ms), serverNowMs: Number(r.now_ms) };
}

export type SettingsAction = { action: 'open' } | { action: 'close' } | { action: 'schedule'; at: Date } | { action: 'clear_schedule' };

export async function updateSettings(db: Db, a: SettingsAction, meta: Meta) {
  const detail = a.action === 'schedule' ? `schedule ${a.at.toISOString()}` : a.action;
  const params: unknown[] = [detail, meta.ip, meta.userAgent];
  let change: string;
  if (a.action === 'open') change = `UPDATE game_settings SET reveal_open = TRUE, updated_at = now() WHERE id = 1 RETURNING id`;
  else if (a.action === 'clear_schedule') change = `UPDATE game_settings SET reveal_at = NULL, updated_at = now() WHERE id = 1 RETURNING id`;
  else if (a.action === 'schedule') {
    params.push(a.at.toISOString());
    change = `UPDATE game_settings SET reveal_open = FALSE, reveal_at = $4, updated_at = now() WHERE id = 1 RETURNING id`;
  } else change = `UPDATE game_settings SET reveal_open = FALSE, reveal_at = NULL, updated_at = now() WHERE id = 1 RETURNING id`;
  // 'close' also locks everyone again, including one-by-one reveals.
  const extra = a.action === 'close' ? `, u2 AS (UPDATE assignments SET revealed_at = NULL WHERE revealed_at IS NOT NULL RETURNING 1)` : '';
  await db.query(
    `WITH u AS (${change})${extra},
          l AS (INSERT INTO access_logs (event, success, detail, ip_address, user_agent) VALUES ('admin_settings', TRUE, $1, $2, $3))
     SELECT count(*) FROM u`,
    params,
  );
}

/** Reveal (or hide again) a single participant's character. One round trip. */
export async function setPersonReveal(db: Db, participantId: string, revealed: boolean, meta: Meta) {
  const [r] = await db.query<{ n: number }>(
    `WITH u AS (UPDATE assignments SET revealed_at = CASE WHEN $2::boolean THEN COALESCE(revealed_at, now()) ELSE NULL END
                 WHERE participant_id = $1 RETURNING id),
          l AS (INSERT INTO access_logs (participant_id, event, success, ip_address, user_agent)
                VALUES ($1, $3, EXISTS (SELECT 1 FROM u), $4, $5))
     SELECT count(*)::int AS n FROM u`,
    [participantId, revealed, revealed ? 'admin_reveal_person' : 'admin_hide_person', meta.ip, meta.userAgent],
  );
  return Number(r.n) > 0;
}
