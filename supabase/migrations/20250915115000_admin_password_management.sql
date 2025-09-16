-- Admin password management functions
-- These allow admins to reset passwords without seeing the original

-- Function to reset employee password (admin only)
CREATE OR REPLACE FUNCTION reset_employee_password(
    target_employee_id UUID,
    new_password TEXT,
    admin_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the caller is an admin
    IF NOT EXISTS(SELECT 1 FROM public.admins WHERE user_id = admin_user_id) THEN
        RAISE EXCEPTION 'Only admins can reset employee passwords';
    END IF;
    
    -- Update the employee password
    UPDATE public.employees 
    SET password_hash = hash_password(new_password)
    WHERE id = target_employee_id;
    
    -- Return true if password was updated
    RETURN FOUND;
END;
$$;

-- Function to reset admin password (super admin only)
CREATE OR REPLACE FUNCTION reset_admin_password(
    target_admin_id UUID,
    new_password TEXT,
    admin_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the caller is an admin
    IF NOT EXISTS(SELECT 1 FROM public.admins WHERE user_id = admin_user_id) THEN
        RAISE EXCEPTION 'Only admins can reset admin passwords';
    END IF;
    
    -- Update the admin password
    UPDATE public.admins 
    SET password_hash = hash_password(new_password)
    WHERE id = target_admin_id;
    
    -- Return true if password was updated
    RETURN FOUND;
END;
$$;

-- Function to generate a temporary password
CREATE OR REPLACE FUNCTION generate_temp_password()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    temp_password TEXT;
BEGIN
    -- Generate a random 8-character password
    temp_password := array_to_string(ARRAY(
        SELECT chr((65 + round(random() * 25))::integer) 
        FROM generate_series(1,4)
    ), '') || 
    array_to_string(ARRAY(
        SELECT chr((48 + round(random() * 9))::integer) 
        FROM generate_series(1,4)
    ), '');
    
    RETURN temp_password;
END;
$$;

-- Function to reset password with auto-generated temp password
CREATE OR REPLACE FUNCTION reset_employee_password_auto(
    target_employee_id UUID,
    admin_user_id UUID DEFAULT auth.uid()
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    temp_password TEXT;
BEGIN
    -- Check if the caller is an admin
    IF NOT EXISTS(SELECT 1 FROM public.admins WHERE user_id = admin_user_id) THEN
        RAISE EXCEPTION 'Only admins can reset employee passwords';
    END IF;
    
    -- Generate temporary password
    temp_password := generate_temp_password();
    
    -- Update the employee password
    UPDATE public.employees 
    SET password_hash = hash_password(temp_password)
    WHERE id = target_employee_id;
    
    -- Return the temporary password (admin can share this with employee)
    RETURN temp_password;
END;
$$;
