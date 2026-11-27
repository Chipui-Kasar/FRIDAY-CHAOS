-- Third blank for the Tangkhul sentence ("Laga I ___ li leishiya"). Nullable so earlier answers stay valid. Idempotent.
ALTER TABLE sentence_responses ADD COLUMN IF NOT EXISTS blank3 TEXT
  CHECK (blank3 IS NULL OR char_length(btrim(blank3)) BETWEEN 1 AND 100);
