-- Reveal switch + countdown. Idempotent. Default = LOCKED until the host opens it.
CREATE TABLE IF NOT EXISTS game_settings (
  id           SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),   -- singleton row
  reveal_open  BOOLEAN NOT NULL DEFAULT FALSE,
  reveal_at    TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO game_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
