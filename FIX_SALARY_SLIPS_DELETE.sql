-- Fix salary slips deletion issue for admins
-- This script ensures admins can delete salary slips

-- First, drop the existing delete policy if it exists
DROP POLICY IF EXISTS "Admins can delete salary slips" ON salary_slips;

-- Create a new DELETE policy for admins
CREATE POLICY "Admins can delete salary slips" ON salary_slips
  FOR DELETE 
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid() IN (SELECT user_id FROM public.admins)
  );

-- Verify all policies on salary_slips table
-- Run this to see all current policies:
-- SELECT * FROM pg_policies WHERE tablename = 'salary_slips';

-- If you want to see the current user's role and check if they're an admin:
-- SELECT auth.uid(), auth.role();
-- SELECT * FROM public.admins WHERE user_id = auth.uid();
