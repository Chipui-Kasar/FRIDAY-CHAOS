-- One answer per person to the Tangkhul fill-in-the-blank sentence. Idempotent.
-- PRIMARY KEY on participant_id => a person can submit once; the trigger blocks any later edit.
CREATE TABLE IF NOT EXISTS sentence_responses (
  participant_id UUID PRIMARY KEY REFERENCES participants(id) ON DELETE CASCADE,
  blank1         TEXT NOT NULL CHECK (char_length(btrim(blank1)) BETWEEN 1 AND 100),
  blank2         TEXT NOT NULL CHECK (char_length(btrim(blank2)) BETWEEN 1 AND 100),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION sentence_responses_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'a submitted sentence cannot be changed';
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS sentence_responses_immutable_trg ON sentence_responses;
CREATE TRIGGER sentence_responses_immutable_trg BEFORE UPDATE ON sentence_responses
  FOR EACH ROW EXECUTE FUNCTION sentence_responses_immutable();
