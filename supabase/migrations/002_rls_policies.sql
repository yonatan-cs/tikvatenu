-- =============================================
-- Row Level Security Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Profiles
-- =============================================

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =============================================
-- Events
-- =============================================

CREATE POLICY "Public can view published events"
  ON events FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all events"
  ON events FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can create events"
  ON events FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update events"
  ON events FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete events"
  ON events FOR DELETE
  USING (is_admin());

-- =============================================
-- Event Registrations
-- =============================================

CREATE POLICY "Public can register for published events"
  ON event_registrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_registrations.event_id
      AND events.is_published = true
      AND (events.registration_deadline IS NULL OR events.registration_deadline > now())
    )
  );

CREATE POLICY "Admins can view registrations"
  ON event_registrations FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update registrations"
  ON event_registrations FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete registrations"
  ON event_registrations FOR DELETE
  USING (is_admin());

-- =============================================
-- Articles
-- =============================================

CREATE POLICY "Public can view published articles"
  ON articles FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all articles"
  ON articles FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can create articles"
  ON articles FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update articles"
  ON articles FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete articles"
  ON articles FOR DELETE
  USING (is_admin());

-- =============================================
-- Updates
-- =============================================

CREATE POLICY "Public can view published updates"
  ON updates FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all updates"
  ON updates FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can create updates"
  ON updates FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update updates"
  ON updates FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete updates"
  ON updates FOR DELETE
  USING (is_admin());

-- =============================================
-- Gallery Albums
-- =============================================

CREATE POLICY "Public can view published albums"
  ON gallery_albums FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all albums"
  ON gallery_albums FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can create albums"
  ON gallery_albums FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update albums"
  ON gallery_albums FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete albums"
  ON gallery_albums FOR DELETE
  USING (is_admin());

-- =============================================
-- Gallery Images
-- =============================================

CREATE POLICY "Public can view images in published albums"
  ON gallery_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_albums
      WHERE gallery_albums.id = gallery_images.album_id
      AND gallery_albums.is_published = true
    )
  );

CREATE POLICY "Admins can view all images"
  ON gallery_images FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can create images"
  ON gallery_images FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update images"
  ON gallery_images FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete images"
  ON gallery_images FOR DELETE
  USING (is_admin());

-- =============================================
-- Join Submissions
-- =============================================

CREATE POLICY "Public can submit join form"
  ON join_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view join submissions"
  ON join_submissions FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update join submissions"
  ON join_submissions FOR UPDATE
  USING (is_admin());

-- =============================================
-- Contact Submissions
-- =============================================

CREATE POLICY "Public can submit contact form"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view contact submissions"
  ON contact_submissions FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions FOR UPDATE
  USING (is_admin());

-- =============================================
-- Site Settings
-- =============================================

CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can insert site settings"
  ON site_settings FOR INSERT
  WITH CHECK (is_admin());
