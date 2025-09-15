-- Fix RLS policies for employees table to allow proper admin access
-- First, let's update the admin view policy to check the admins table instead of auth metadata
DROP POLICY IF EXISTS "Admins can view all employees" ON public.employees;

CREATE POLICY "Admins can view all employees"
ON public.employees
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admins 
  WHERE admins.user_id = auth.uid()
));

-- Also add a policy for employees to view their own record
CREATE POLICY "Employees can view own record"
ON public.employees
FOR SELECT
TO authenticated
USING (user_id = auth.uid());