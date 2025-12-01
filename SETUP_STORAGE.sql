-- ============================================
-- STORAGE BUCKET SETUP FOR EMPLOYEE DOCUMENTS
-- Run this script in Supabase SQL Editor
-- ============================================

-- Step 1: Create storage bucket for employee documents
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'employee-documents',
  'employee-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
-- ============================================

DROP POLICY IF EXISTS "Admins can upload employee documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all employee documents" ON storage.objects;
DROP POLICY IF EXISTS "Employees can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update employee documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete employee documents" ON storage.objects;

-- Step 3: Create storage policies for employee-documents bucket
-- ============================================

-- Policy 1: Admins can upload employee documents
CREATE POLICY "Admins can upload employee documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'employee-documents' AND
    EXISTS (
      SELECT 1 FROM public.employees WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 2: Admins can view all employee documents
CREATE POLICY "Admins can view all employee documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'employee-documents' AND
    EXISTS (
      SELECT 1 FROM public.employees WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 3: Employees can view their own documents
CREATE POLICY "Employees can view their own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'employee-documents' AND
    (
      -- Check if the file path contains the employee's ID
      name LIKE '%' || (SELECT employee_id FROM public.employees WHERE user_id = auth.uid()) || '%'
    )
  );

-- Policy 4: Admins can update employee documents
CREATE POLICY "Admins can update employee documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'employee-documents' AND
    EXISTS (
      SELECT 1 FROM public.employees WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 5: Admins can delete employee documents
CREATE POLICY "Admins can delete employee documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'employee-documents' AND
    EXISTS (
      SELECT 1 FROM public.employees WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- VERIFICATION QUERIES
-- Run these after the above to verify setup
-- ============================================

-- Check if storage bucket was created
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'employee-documents';

-- Check if all 5 policies were created
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%employee documents%'
ORDER BY policyname;

-- Expected result: You should see 5 policies
-- 1. Admins can delete employee documents
-- 2. Admins can update employee documents  
-- 3. Admins can upload employee documents
-- 4. Admins can view all employee documents
-- 5. Employees can view their own documents
