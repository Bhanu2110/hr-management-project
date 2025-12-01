-- ============================================
-- COMPLETE SETUP SCRIPT FOR EMPLOYEE FORM
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- Step 1: Add new columns to employees table
-- ============================================

ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS aadhar_document_url TEXT,
ADD COLUMN IF NOT EXISTS pan_document_url TEXT,
ADD COLUMN IF NOT EXISTS salary_slip_url TEXT,
ADD COLUMN IF NOT EXISTS current_ctc DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS ctc_effective_date DATE,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS ifsc_code TEXT,
ADD COLUMN IF NOT EXISTS branch_name TEXT,
ADD COLUMN IF NOT EXISTS account_holder_name TEXT;

-- Step 2: Create storage bucket
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

-- Step 3: Drop existing policies if they exist
-- ============================================

DROP POLICY IF EXISTS "Admins can upload employee documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all employee documents" ON storage.objects;
DROP POLICY IF EXISTS "Employees can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update employee documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete employee documents" ON storage.objects;

-- Step 4: Create storage policies
-- ============================================

-- Admins can upload employee documents
CREATE POLICY "Admins can upload employee documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'employee-documents' AND
    EXISTS (
      SELECT 1 FROM employees WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can view all employee documents
CREATE POLICY "Admins can view all employee documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'employee-documents' AND
    EXISTS (
      SELECT 1 FROM employees WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Employees can view their own documents
CREATE POLICY "Employees can view their own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'employee-documents' AND
    (
      name LIKE '%' || (SELECT employee_id FROM employees WHERE user_id = auth.uid()) || '%'
    )
  );

-- Admins can update employee documents
CREATE POLICY "Admins can update employee documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'employee-documents' AND
    EXISTS (
      SELECT 1 FROM employees WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete employee documents
CREATE POLICY "Admins can delete employee documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'employee-documents' AND
    EXISTS (
      SELECT 1 FROM employees WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify everything is set up
-- ============================================

-- Check if new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'employees' 
  AND column_name IN (
    'aadhar_document_url', 
    'pan_document_url', 
    'salary_slip_url',
    'current_ctc',
    'ctc_effective_date',
    'bank_name',
    'account_number',
    'ifsc_code',
    'branch_name',
    'account_holder_name'
  )
ORDER BY column_name;

-- Check if storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'employee-documents';

-- Check storage policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%employee documents%';
