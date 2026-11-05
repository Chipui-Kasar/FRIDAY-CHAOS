-- Per-person reveal. Idempotent. NULL = not individually revealed.
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS revealed_at TIMESTAMPTZ;
