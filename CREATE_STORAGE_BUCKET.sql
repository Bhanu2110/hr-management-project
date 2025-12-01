-- =================================================================
-- CREATE STORAGE BUCKET SCRIPT
-- Run this in Supabase SQL Editor to fix "Bucket not found" error
-- =================================================================

-- 1. Create the 'employee-documents' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-documents', 'employee-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Enable RLS on objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create Policy: Allow Public Read Access (for downloading)
-- This allows anyone with the link (like the one in your table) to download the file
DROP POLICY IF EXISTS "Public Access to Employee Documents" ON storage.objects;
CREATE POLICY "Public Access to Employee Documents"
ON storage.objects FOR SELECT
USING ( bucket_id = 'employee-documents' );

-- 4. Create Policy: Allow Authenticated Users to Upload
DROP POLICY IF EXISTS "Authenticated Users Can Upload" ON storage.objects;
CREATE POLICY "Authenticated Users Can Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'employee-documents' 
  AND auth.role() = 'authenticated'
);

-- 5. Create Policy: Allow Users to Update/Delete their own files
DROP POLICY IF EXISTS "Users Can Update Own Files" ON storage.objects;
CREATE POLICY "Users Can Update Own Files"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'employee-documents' AND auth.uid() = owner );

DROP POLICY IF EXISTS "Users Can Delete Own Files" ON storage.objects;
CREATE POLICY "Users Can Delete Own Files"
ON storage.objects FOR DELETE
USING ( bucket_id = 'employee-documents' AND auth.uid() = owner );

-- 6. Verify Bucket Exists
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'employee-documents';
