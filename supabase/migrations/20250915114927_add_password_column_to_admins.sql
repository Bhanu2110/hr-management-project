-- Add password column to admins table
-- This will allow storing hashed passwords for admin authentication

-- Add password column (nullable initially to handle existing records)
ALTER TABLE public.admins 
ADD COLUMN password_hash TEXT;

-- Add comment to clarify the purpose
COMMENT ON COLUMN public.admins.password_hash IS 'Hashed password for admin authentication';

-- Update existing admins to have a default password (you can change this later)
-- For now, we'll use a default password that should be changed immediately
UPDATE public.admins 
SET password_hash = hash_password('admin123')
WHERE password_hash IS NULL;

-- Make password_hash NOT NULL after setting default values
ALTER TABLE public.admins 
ALTER COLUMN password_hash SET NOT NULL;

-- Create trigger function to automatically hash admin passwords on insert/update
CREATE OR REPLACE FUNCTION hash_admin_password()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only hash if password_hash is being set and doesn't look like it's already hashed
    IF NEW.password_hash IS NOT NULL AND (OLD.password_hash IS NULL OR NEW.password_hash != OLD.password_hash) THEN
        -- Check if it's already a bcrypt hash (starts with $2a$, $2b$, or $2y$)
        IF NEW.password_hash !~ '^\$2[aby]\$' THEN
            NEW.password_hash = hash_password(NEW.password_hash);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger to automatically hash admin passwords
CREATE TRIGGER hash_admin_password_trigger
    BEFORE INSERT OR UPDATE ON public.admins
    FOR EACH ROW
    EXECUTE FUNCTION hash_admin_password();

-- Create a function to authenticate admin users
CREATE OR REPLACE FUNCTION authenticate_admin(admin_email TEXT, password TEXT)
RETURNS TABLE(
    id UUID,
    admin_id VARCHAR,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    department TEXT,
    "position" TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.admin_id,
        a.first_name,
        a.last_name,
        a.email,
        a.department,
        a."position"
    FROM public.admins a
    WHERE a.email = admin_email 
    AND verify_password(password, a.password_hash)
    AND a.status = 'active';
END;
$$;
