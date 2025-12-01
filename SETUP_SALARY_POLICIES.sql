-- ============================================
-- SALARY SLIPS RLS POLICIES
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable RLS on salary_slips if not already enabled
ALTER TABLE public.salary_slips ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can do everything on salary_slips" ON public.salary_slips;
DROP POLICY IF EXISTS "Employees can view their own salary slips" ON public.salary_slips;

-- Policy 1: Admins can do everything (Select, Insert, Update, Delete)
CREATE POLICY "Admins can do everything on salary_slips"
ON public.salary_slips
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr')
  )
);

-- Policy 2: Employees can view their own salary slips
CREATE POLICY "Employees can view their own salary slips"
ON public.salary_slips
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE user_id = auth.uid()
  )
);

-- Verify policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'salary_slips';
