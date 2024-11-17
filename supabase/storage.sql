-- Enable storage policies for the 'only-diamonds' bucket
BEGIN;

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('only-diamonds', 'only-diamonds', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'only-diamonds');

-- Allow authenticated users to upload files
CREATE POLICY "Allow uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'only-diamonds'
  AND (auth.role() = 'authenticated' OR EXISTS (
    SELECT 1 FROM users
    WHERE id::text = (storage.foldername(name))[1]
  ))
);

-- Allow users to update their own files
CREATE POLICY "Allow updates"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'only-diamonds'
  AND (auth.role() = 'authenticated' OR EXISTS (
    SELECT 1 FROM users
    WHERE id::text = (storage.foldername(name))[1]
  ))
);

-- Allow users to delete their own files
CREATE POLICY "Allow deletes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'only-diamonds'
  AND (auth.role() = 'authenticated' OR EXISTS (
    SELECT 1 FROM users
    WHERE id::text = (storage.foldername(name))[1]
  ))
);

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

COMMIT;