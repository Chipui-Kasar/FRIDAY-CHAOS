# Undercover Friday portal

Private game portal for ~17 known participants. Enter your email → your assignment is bound to **the first device** that claims it. No OTP, no email verification, no magic links.

## Setup
```bash
npm i
cp .env.example .env.local            # DATABASE_URL (Neon), ADMIN_PASSWORD, ADMIN_SESSION_SECRET
npm run db:migrate                    # applies db/schema.sql (idempotent)
cp data/participants.example.csv data/participants.csv   # name,email,assignment
npm run db:seed
npm run dev                           # participants: /   host: /admin
npm test                              # 21 tests, run against in-process Postgres (PGlite)
```
If your Neon `participants` table already exists, drop that `CREATE TABLE` from `db/schema.sql` — the code only needs `id uuid`, `name`, `email` (lower-cased/trimmed) and `is_active`.

## How the device lock works
1. Email is trimmed + lower-cased and looked up in `participants`. Unknown → `Access not available.`
2. Registration is one transaction: a conditional `INSERT … ON CONFLICT (participant_id) DO UPDATE … WHERE revoked_at IS NOT NULL AND reset_allowed`. `participant_device_access.participant_id` is `UNIQUE`, so concurrent requests can't both win; losers get 0 rows and are denied.
3. A 256-bit token is generated with `crypto.randomBytes`. Only its SHA-256 is stored. The raw token lives only in an `HttpOnly; Secure; SameSite=Lax` cookie (`ff_device`).
4. `GET /api/assignment` takes **no parameters**. It hashes the cookie, joins to the participant, and returns that participant's assignment. Email/ID in URL, body, headers or browser storage are never read.
5. `assignments.claimed_at` / `claimed_participant_id` are set on first claim and protected by a trigger so they can never change, even through admin reset.
6. Another browser → `This assignment has already been opened on another device. Contact the game host if you need access restored.`

**Admin (`/admin`, password + HMAC-signed cookie):** status table, registration / last-access times, access logs, **Revoke** (locks the participant out until reset), **Reset access** (revokes the old token and permits exactly one new registration). Admin sees status only, never assignment text.

**Reveal switch:** `game_settings` (singleton row) holds `reveal_open` and `reveal_at`. While locked, the server doesn't read or send the assignment text at all (checked in the same single query as device auth), so view-source can't peek. The waiting-room countdown is cosmetic; the server decides when to unlock.

**Per-person reveal:** `assignments.revealed_at`. A character is shown if the global switch is open **or** that person's `revealed_at` is set; checked server-side in the same query. "Lock all" clears every individual reveal.

**Host-controlled reveal only:** participants have no reveal/hide control. While locked the server never sends the text; once the host unlocks them (one person or all) the page shows the character directly.

**Client storage:** `localStorage` holds email + first name (convenience prefill), `sessionStorage` a "revealed" flag. Never tokens or assignments. IndexedDB isn't needed and isn't used.

**Rate limiting** (stored in Postgres, so it works on serverless): 30 lookups / 10 min / IP and 10 / 10 min / email; 10 admin logins / 10 min / IP. IP and user-agent are audit metadata only. IP is a rate-limit bucket key, never an identity. This assumes a trusted proxy (e.g. Vercel) sets `x-forwarded-for`.

## ⚠️ Security trade-off (read this)
There is no identity verification. **Entering a registered email does not prove you own it.** Whoever knows a participant's email and reaches the portal *first* can claim that participant's assignment, and the real participant is then locked out until the host resets them. Device binding only stops *later* devices.

Acceptable for a casual game among colleagues; not acceptable for anything sensitive. Mitigations in place: first claim is logged (time, IP, user-agent) and visible to the host, who can reset in one click; rate limits slow enumeration. Also note the required UX messages reveal whether an email is registered/claimed, so rate-limiting is the only brake on guessing the participant list. If this ever matters, add a shared join code or email verification.

Other limits: a participant who clears cookies, switches browser or gets a new phone needs a host reset. A device bound to one participant can't claim another (shared computers need a reset or a different browser profile).

## Tests (`tests/access.test.ts`)
Registration + hash-only storage + cookie flags, unregistered rejection, second-device denial, concurrent claims (also after reset), localStorage tampering/clearing, cookie clearing, ID/email parameter tampering, forged cookies, revoked tokens, admin reset (old token dead, new one works, claim record kept), admin auth, rate limiting, non-JSON rejection. Caveat: PGlite serialises transactions on one connection, so the concurrency test mainly proves the denial logic. The cross-connection guarantee on Neon comes from the `UNIQUE` constraint plus the conditional upsert.
# FRIDAY-CHAOS
