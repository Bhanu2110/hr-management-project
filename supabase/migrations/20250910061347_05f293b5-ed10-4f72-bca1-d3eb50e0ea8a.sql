-- Fix RLS policies to allow users to insert their own records during signup

-- Update admins table policies
DROP POLICY IF EXISTS "Users can view their own admin record" ON public.admins;
DROP POLICY IF EXISTS "Users can update their own admin record" ON public.admins;
DROP POLICY IF EXISTS "Admins can view all admin records" ON public.admins;

-- Create new policies for admins table
CREATE POLICY "Users can insert their own admin record" 
ON public.admins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own admin record" 
ON public.admins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own admin record" 
ON public.admins 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all admin records" 
ON public.admins 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

-- Update employees table policies
DROP POLICY IF EXISTS "Employees can view their own record" ON public.employees;
DROP POLICY IF EXISTS "Users can update their own employee record" ON public.employees;
DROP POLICY IF EXISTS "Admins can view all employee records" ON public.employees;
DROP POLICY IF EXISTS "Admins can manage all employee records" ON public.employees;

-- Create new policies for employees table
CREATE POLICY "Users can insert their own employee record" 
ON public.employees 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own employee record" 
ON public.employees 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own employee record" 
ON public.employees 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all employee records" 
ON public.employees 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all employee records" 
ON public.employees 
FOR ALL 
USING (public.get_current_user_role() = 'admin');