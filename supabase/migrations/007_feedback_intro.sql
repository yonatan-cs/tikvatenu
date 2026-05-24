-- Optional intro text shown above feedback form
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS feedback_intro_he text,
  ADD COLUMN IF NOT EXISTS feedback_intro_en text;
