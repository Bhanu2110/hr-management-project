-- Fix security warning by setting search_path for functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix the get_current_user_role function with proper search_path
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