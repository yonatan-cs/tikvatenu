-- =============================================
-- Tikvatenu Database Schema
-- =============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Helper Functions
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if current user is admin/editor
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Tables
-- =============================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'editor');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Events
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_he text NOT NULL,
  title_en text,
  description_he text,
  description_en text,
  body_he text,
  body_en text,
  cover_image text,
  location_he text,
  location_en text,
  location_url text,
  event_date timestamptz NOT NULL,
  event_end_date timestamptz,
  registration_deadline timestamptz,
  max_participants integer,
  registration_fields jsonb DEFAULT '[]'::jsonb,
  is_published boolean DEFAULT false,
  summary_he text,
  summary_en text,
  author_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Event Registrations
CREATE TABLE event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  custom_fields jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlist')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, email)
);

-- Articles (Magazine content)
CREATE TABLE articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_he text NOT NULL,
  title_en text,
  excerpt_he text,
  excerpt_en text,
  body_he text,
  body_en text,
  cover_image text,
  category text NOT NULL CHECK (category IN ('thought', 'press', 'opinion', 'spirit')),
  tags text[] DEFAULT '{}',
  is_published boolean DEFAULT false,
  published_at timestamptz,
  author_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Updates (home feed news)
CREATE TABLE updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_he text NOT NULL,
  title_en text,
  body_he text,
  body_en text,
  cover_image text,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  author_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_updates_updated_at
  BEFORE UPDATE ON updates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Gallery Albums
CREATE TABLE gallery_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_he text NOT NULL,
  title_en text,
  description_he text,
  description_en text,
  cover_image text,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  is_published boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  author_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Gallery Images
CREATE TABLE gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption_he text,
  caption_en text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Join Submissions
CREATE TABLE join_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  interests text,
  how_heard text,
  message text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Contact Submissions
CREATE TABLE contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Site Settings
CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES
  ('featured_article_id', '"null"'::jsonb),
  ('instagram_url', '"https://instagram.com/tikvatenu"'::jsonb),
  ('hero_config', '{"show_next_event": true}'::jsonb);

-- =============================================
-- Content Feed View
-- =============================================

CREATE VIEW content_feed AS
  SELECT id, 'event' as content_type, slug, title_he, title_en,
         description_he as excerpt_he, description_en as excerpt_en,
         cover_image, event_date as display_date, created_at
  FROM events WHERE is_published = true
UNION ALL
  SELECT id, 'article' as content_type, slug, title_he, title_en,
         excerpt_he, excerpt_en,
         cover_image, COALESCE(published_at, created_at) as display_date, created_at
  FROM articles WHERE is_published = true
UNION ALL
  SELECT id, 'update' as content_type, slug, title_he, title_en,
         LEFT(body_he, 200) as excerpt_he, LEFT(body_en, 200) as excerpt_en,
         cover_image, COALESCE(published_at, created_at) as display_date, created_at
  FROM updates WHERE is_published = true;
