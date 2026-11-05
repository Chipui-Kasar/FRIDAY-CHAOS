-- Fun Friday portal schema (idempotent). Requires Postgres 13+ (gen_random_uuid built in).

CREATE TABLE IF NOT EXISTS participants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT participants_email_normalized CHECK (email = lower(btrim(email)))
);
CREATE UNIQUE INDEX IF NOT EXISTS participants_email_key ON participants (email);

CREATE TABLE IF NOT EXISTS assignments (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id          UUID NOT NULL UNIQUE REFERENCES participants(id) ON DELETE CASCADE,
  content                 TEXT NOT NULL,
  claimed_at              TIMESTAMPTZ,
  claimed_participant_id  UUID REFERENCES participants(id),
  CONSTRAINT assignments_claim_consistent CHECK ((claimed_at IS NULL) = (claimed_participant_id IS NULL)),
  CONSTRAINT assignments_claim_is_owner   CHECK (claimed_participant_id IS NULL OR claimed_participant_id = participant_id)
);

-- claimed_at / claimed_participant_id are permanent: once set they can never change (not even by admin reset).
CREATE OR REPLACE FUNCTION assignments_claim_immutable() RETURNS trigger AS $$
BEGIN
  IF OLD.claimed_at IS NOT NULL AND
     (NEW.claimed_at IS DISTINCT FROM OLD.claimed_at OR
      NEW.claimed_participant_id IS DISTINCT FROM OLD.claimed_participant_id) THEN
    RAISE EXCEPTION 'assignment claim is permanent';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS assignments_claim_immutable_trg ON assignments;
CREATE TRIGGER assignments_claim_immutable_trg BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION assignments_claim_immutable();

-- One row per participant (UNIQUE participant_id) => at most one registered device, enforced by the database.
CREATE TABLE IF NOT EXISTS participant_device_access (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id    UUID NOT NULL UNIQUE REFERENCES participants(id) ON DELETE CASCADE,
  device_token_hash TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_accessed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at        TIMESTAMPTZ,
  reset_allowed     BOOLEAN NOT NULL DEFAULT FALSE,  -- admin reset: a revoked row may be re-claimed once
  user_agent        TEXT,
  ip_address        TEXT,
  CONSTRAINT pda_hash_is_sha256 CHECK (device_token_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT pda_reset_requires_revoked CHECK (NOT reset_allowed OR revoked_at IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS pda_token_hash_key ON participant_device_access (device_token_hash);

CREATE TABLE IF NOT EXISTS access_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  email_attempted TEXT,
  event          TEXT NOT NULL,
  success        BOOLEAN NOT NULL,
  detail         TEXT,
  ip_address     TEXT,
  user_agent     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS access_logs_created_idx ON access_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS access_logs_participant_idx ON access_logs (participant_id, created_at DESC);

CREATE TABLE IF NOT EXISTS rate_limits (
  key          TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count        INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);
