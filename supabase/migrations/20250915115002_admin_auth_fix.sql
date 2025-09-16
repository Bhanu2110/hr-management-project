-- Fix admin authentication and add plain text password storage
-- This allows manual admin creation and password visibility

-- Add plain text password column for admin visibility
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS password_plain TEXT;

-- Add comment
COMMENT ON COLUMN public.admins.password_plain IS 'Plain text password for admin visibility (development only)';

-- Function to create auth user when admin is inserted
CREATE OR REPLACE FUNCTION create_auth_user_for_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user_id UUID;
    temp_password TEXT;
BEGIN
    -- Generate default password if not provided
    IF NEW.password_plain IS NULL THEN
        NEW.password_plain := 'admin123';
    END IF;
    
    temp_password := NEW.password_plain;
    
    -- Check if auth user already exists
    SELECT id INTO auth_user_id
    FROM auth.users
    WHERE email = NEW.email;
    
    IF NOT FOUND THEN
        -- Create new auth user
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            NEW.email,
            crypt(temp_password, gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO auth_user_id;
        
        -- Update the admin record with the auth user_id
        NEW.user_id := auth_user_id;
    ELSE
        -- Update existing auth user password
        UPDATE auth.users 
        SET encrypted_password = crypt(temp_password, gen_salt('bf'))
        WHERE id = auth_user_id;
        
        NEW.user_id := auth_user_id;
    END IF;
    
    -- Set the hashed password
    NEW.password_hash := hash_password(temp_password);
    
    RETURN NEW;
END;
$$;

-- Create trigger for auto auth user creation
DROP TRIGGER IF EXISTS create_auth_user_trigger ON public.admins;
CREATE TRIGGER create_auth_user_trigger
    BEFORE INSERT OR UPDATE ON public.admins
    FOR EACH ROW
    EXECUTE FUNCTION create_auth_user_for_admin();

-- Function to update existing admins with proper auth setup
CREATE OR REPLACE FUNCTION fix_existing_admins()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_record RECORD;
    auth_user_id UUID;
    default_password TEXT := 'admin123';
BEGIN
    -- Loop through all admins without proper user_id
    FOR admin_record IN 
        SELECT * FROM public.admins 
        WHERE user_id IS NULL OR user_id = '00000000-0000-0000-0000-000000000000'
    LOOP
        -- Check if auth user exists
        SELECT id INTO auth_user_id
        FROM auth.users
        WHERE email = admin_record.email;
        
        IF NOT FOUND THEN
            -- Create auth user
            INSERT INTO auth.users (
                instance_id,
                id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at,
                created_at,
                updated_at,
                confirmation_token,
                email_change,
                email_change_token_new,
                recovery_token
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                gen_random_uuid(),
                'authenticated',
                'authenticated',
                admin_record.email,
                crypt(default_password, gen_salt('bf')),
                NOW(),
                NOW(),
                NOW(),
                '',
                '',
                '',
                ''
            ) RETURNING id INTO auth_user_id;
        END IF;
        
        -- Update admin record
        UPDATE public.admins
        SET 
            user_id = auth_user_id,
            password_plain = default_password,
            password_hash = hash_password(default_password)
        WHERE id = admin_record.id;
        
        RAISE NOTICE 'Fixed admin: % with password: %', admin_record.email, default_password;
    END LOOP;
END;
$$;

-- Run the fix for existing admins
SELECT fix_existing_admins();

-- Function to create admin with visible password
CREATE OR REPLACE FUNCTION create_admin_with_password(
    admin_email TEXT,
    admin_password TEXT,
    admin_first_name TEXT,
    admin_last_name TEXT,
    admin_department TEXT DEFAULT NULL,
    admin_position TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_admin_id UUID;
    admin_code VARCHAR;
BEGIN
    -- Generate admin code
    admin_code := 'ADM' || EXTRACT(EPOCH FROM NOW())::bigint;
    
    -- Insert admin (trigger will handle auth user creation)
    INSERT INTO public.admins (
        admin_id,
        first_name,
        last_name,
        email,
        department,
        "position",
        password_plain
    ) VALUES (
        admin_code,
        admin_first_name,
        admin_last_name,
        admin_email,
        admin_department,
        admin_position,
        admin_password
    ) RETURNING id INTO new_admin_id;
    
    RETURN new_admin_id;
END;
$$;
