-- =============================================================
-- Migration 001: Ensure UNIQUE constraint on daily_puzzles date_string
-- Required for race-safe puzzle generation from the Edge Function.
-- The constraint allows only one nonogram per calendar date.
-- =============================================================

-- Ensure the daily_puzzles table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.daily_puzzles (
  id          bigserial PRIMARY KEY,
  date_string text        NOT NULL,
  category    text        NOT NULL DEFAULT 'nonogram',
  title       text        NOT NULL,
  width       integer     NOT NULL,
  height      integer     NOT NULL,
  solution    jsonb       NOT NULL,
  row_clues   jsonb       NOT NULL DEFAULT '[]',
  col_clues   jsonb       NOT NULL DEFAULT '[]',
  source_image text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Add UNIQUE constraint on (date_string, category) if not already present.
-- This is the key constraint that prevents duplicate puzzles for the same date.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_constraint
    WHERE  conname = 'daily_puzzles_date_string_category_key'
      AND  conrelid = 'public.daily_puzzles'::regclass
  ) THEN
    ALTER TABLE public.daily_puzzles
      ADD CONSTRAINT daily_puzzles_date_string_category_key
      UNIQUE (date_string, category);
  END IF;
END$$;

-- Also ensure a puzzle_generation_logs table exists for admin audit trail
CREATE TABLE IF NOT EXISTS public.puzzle_generation_logs (
  id          bigserial    PRIMARY KEY,
  date_string text         NOT NULL,
  status      text         NOT NULL CHECK (status IN ('success', 'failed')),
  message     text         NOT NULL,
  puzzle_title text,
  grid_size   text,
  duration_ms integer,
  created_at  timestamptz  NOT NULL DEFAULT now()
);
