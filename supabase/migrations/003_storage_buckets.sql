-- =============================================
-- Storage Buckets
-- =============================================

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('event-images', 'event-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('article-images', 'article-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('gallery-images', 'gallery-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('general', 'general', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);

-- Storage policies: public read, authenticated write

-- Event images
CREATE POLICY "Public read event images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

CREATE POLICY "Admins upload event images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-images' AND (SELECT is_admin()));

CREATE POLICY "Admins delete event images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'event-images' AND (SELECT is_admin()));

-- Article images
CREATE POLICY "Public read article images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-images');

CREATE POLICY "Admins upload article images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'article-images' AND (SELECT is_admin()));

CREATE POLICY "Admins delete article images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'article-images' AND (SELECT is_admin()));

-- Gallery images
CREATE POLICY "Public read gallery images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-images');

CREATE POLICY "Admins upload gallery images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery-images' AND (SELECT is_admin()));

CREATE POLICY "Admins delete gallery images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery-images' AND (SELECT is_admin()));

-- General bucket
CREATE POLICY "Public read general"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'general');

CREATE POLICY "Admins upload general"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'general' AND (SELECT is_admin()));

CREATE POLICY "Admins delete general"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'general' AND (SELECT is_admin()));
