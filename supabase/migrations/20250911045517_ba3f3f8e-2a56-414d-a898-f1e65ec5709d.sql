-- Disable RLS on all tables to resolve access denied issues

-- Disable RLS on admins table
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- Disable RLS on employees table  
ALTER TABLE public.employees DISABLE ROW LEVEL SECURITY;

-- Disable RLS on attendance table
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;

-- Disable RLS on leave_requests table
ALTER TABLE public.leave_requests DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies since RLS is disabled
DROP POLICY IF EXISTS "Users can insert their own admin record" ON public.admins;
DROP POLICY IF EXISTS "Users can view their own admin record" ON public.admins;
DROP POLICY IF EXISTS "Users can update their own admin record" ON public.admins;
DROP POLICY IF EXISTS "Admins can view all admin records" ON public.admins;

DROP POLICY IF EXISTS "Users can insert their own employee record" ON public.employees;
DROP POLICY IF EXISTS "Users can view their own employee record" ON public.employees;
DROP POLICY IF EXISTS "Users can update their own employee record" ON public.employees;
DROP POLICY IF EXISTS "Admins can view all employee records" ON public.employees;
DROP POLICY IF EXISTS "Admins can manage all employee records" ON public.employees;

DROP POLICY IF EXISTS "Employees can view their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can view all attendance" ON public.attendance;
DROP POLICY IF EXISTS "Employees can create their own attendance records" ON public.attendance;
DROP POLICY IF EXISTS "Employees can update their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Employees can insert their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can update attendance" ON public.attendance;

DROP POLICY IF EXISTS "Employees can view their own leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Employees can create their own leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Employees can update their own pending leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Admins can view all leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Admins can update any leave request" ON public.leave_requests;