-- ============================================
-- FIX SALARY SLIPS RLS POLICY
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop the incorrect policy
DROP POLICY IF EXISTS "Employees can view their own salary slips" ON public.salary_slips;

-- Create the corrected policy
-- This allows employees to view slips whether they are linked by String ID ("EMP-001") or UUID
CREATE POLICY "Employees can view their own salary slips"
ON public.salary_slips
FOR SELECT
USING (
  -- Check if salary_slips.employee_id matches the employee's String ID
  employee_id IN (
    SELECT employee_id FROM public.employees 
    WHERE user_id = auth.uid()
  )
  OR
  -- Check if salary_slips.employee_id matches the employee's UUID
  employee_id IN (
    SELECT id::text FROM public.employees 
    WHERE user_id = auth.uid()
  )
);

-- Verify the new policy
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'salary_slips';
