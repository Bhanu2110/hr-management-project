-- Fix remaining functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS TEXT AS $$
BEGIN
  -- Check if user is admin
  IF EXISTS(SELECT 1 FROM public.admins WHERE user_id = get_user_role.user_id) THEN
    RETURN 'admin';
  END IF;
  
  -- Check if user is employee
  IF EXISTS(SELECT 1 FROM public.employees WHERE user_id = get_user_role.user_id) THEN
    RETURN 'employee';
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = is_admin.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;