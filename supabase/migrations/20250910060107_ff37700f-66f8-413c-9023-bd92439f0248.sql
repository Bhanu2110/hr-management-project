-- Drop existing problematic functions and triggers
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_with_role() CASCADE;

-- Create admins table
CREATE TABLE public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  admin_id VARCHAR NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT,
  position TEXT,
  phone TEXT,
  hire_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employees table (modify existing or create new structure)
DROP TABLE IF EXISTS public.employees CASCADE;
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  employee_id VARCHAR NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  department TEXT,
  position TEXT,
  phone TEXT,
  hire_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admins table
CREATE POLICY "Admins can view all admin records" 
ON public.admins 
FOR SELECT 
USING (true);

CREATE POLICY "Users can view their own admin record" 
ON public.admins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own admin record" 
ON public.admins 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for employees table
CREATE POLICY "Admins can view all employee records" 
ON public.employees 
FOR SELECT 
USING (EXISTS(SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

CREATE POLICY "Employees can view their own record" 
ON public.employees 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own employee record" 
ON public.employees 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all employee records" 
ON public.employees 
FOR ALL 
USING (EXISTS(SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

-- Add triggers for timestamp updates
CREATE TRIGGER update_admins_updated_at
BEFORE UPDATE ON public.admins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get user role from either table
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  -- Check if user is admin
  IF EXISTS(SELECT 1 FROM public.admins WHERE user_id = auth.uid()) THEN
    RETURN 'admin';
  END IF;
  
  -- Check if user is employee
  IF EXISTS(SELECT 1 FROM public.employees WHERE user_id = auth.uid()) THEN
    RETURN 'employee';
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;