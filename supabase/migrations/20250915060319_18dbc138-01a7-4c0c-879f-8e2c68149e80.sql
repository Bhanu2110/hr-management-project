-- Enable RLS on all missing tables to fix security issues
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for admins table
CREATE POLICY "Admins can view own record"
ON public.admins
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can update own record"  
ON public.admins
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Add RLS policies for attendance table
CREATE POLICY "Employees can view own attendance"
ON public.attendance
FOR SELECT
TO authenticated
USING (employee_id IN (
  SELECT id FROM public.employees WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can view all attendance"
ON public.attendance
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admins WHERE user_id = auth.uid()
));

CREATE POLICY "Employees can manage own attendance"
ON public.attendance
FOR ALL
TO authenticated
USING (employee_id IN (
  SELECT id FROM public.employees WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage all attendance"
ON public.attendance
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admins WHERE user_id = auth.uid()
));

-- Add RLS policies for leave_requests table
CREATE POLICY "Employees can view own leave requests"
ON public.leave_requests
FOR SELECT
TO authenticated
USING (employee_id IN (
  SELECT id FROM public.employees WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can view all leave requests"
ON public.leave_requests
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admins WHERE user_id = auth.uid()
));

CREATE POLICY "Employees can create own leave requests"
ON public.leave_requests
FOR INSERT
TO authenticated
WITH CHECK (employee_id IN (
  SELECT id FROM public.employees WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage all leave requests"
ON public.leave_requests
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admins WHERE user_id = auth.uid()
));