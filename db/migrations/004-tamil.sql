-- Optional Tamil translation of each assignment (same layout as `content`). Idempotent.
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS content_ta TEXT;
