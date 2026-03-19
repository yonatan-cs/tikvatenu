-- Add pdf_url column to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS pdf_url TEXT DEFAULT NULL;

-- Create storage bucket for article PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('article-pdfs', 'article-pdfs', true, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for article PDFs
CREATE POLICY "Public read article pdfs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-pdfs');

CREATE POLICY "Admins upload article pdfs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'article-pdfs' AND (SELECT is_admin()));

CREATE POLICY "Admins delete article pdfs"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'article-pdfs' AND (SELECT is_admin()));
