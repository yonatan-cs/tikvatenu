-- =============================================
-- Event Feedbacks
-- =============================================

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS feedback_fields jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS event_feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  respondent_name text NOT NULL,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_feedbacks_event_id_idx ON event_feedbacks(event_id);
CREATE INDEX IF NOT EXISTS event_feedbacks_created_at_idx ON event_feedbacks(created_at DESC);

ALTER TABLE event_feedbacks ENABLE ROW LEVEL SECURITY;

-- Public can submit feedback only for published events that have started/passed
CREATE POLICY "Public can submit feedback for past events"
  ON event_feedbacks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_feedbacks.event_id
      AND events.is_published = true
      AND events.event_date < now()
    )
  );

CREATE POLICY "Admins can view feedbacks"
  ON event_feedbacks FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can delete feedbacks"
  ON event_feedbacks FOR DELETE
  USING (is_admin());
