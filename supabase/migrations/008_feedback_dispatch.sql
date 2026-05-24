-- Per-event opt-in for auto feedback emails
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS feedback_auto_send boolean NOT NULL DEFAULT false;

-- Per-registration delivery tracking
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS feedback_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS feedback_wa_marked_at timestamptz;

CREATE INDEX IF NOT EXISTS event_registrations_feedback_email_idx
  ON event_registrations(event_id, feedback_email_sent_at);
