-- Add password column to employees table
-- This will allow storing hashed passwords separately from PAN numbers

-- Add password column (nullable initially to handle existing records)
ALTER TABLE public.employees 
ADD COLUMN password_hash TEXT;

-- Add comment to clarify the purpose
COMMENT ON COLUMN public.employees.password_hash IS 'Hashed password for employee authentication';

-- Create function to hash passwords using bcrypt
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN crypt(password, gen_salt('bf'));
END;
$$;

-- Create function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN hash = crypt(password, hash);
END;
$$;

-- Update existing employees to have a default password (you can change this later)
-- For now, we'll use their PAN number as the initial password
UPDATE public.employees 
SET password_hash = hash_password(COALESCE(pan_number, 'temp123'))
WHERE password_hash IS NULL;

-- Make password_hash NOT NULL after setting default values
ALTER TABLE public.employees 
ALTER COLUMN password_hash SET NOT NULL;

-- Create trigger function to automatically hash passwords on insert/update
CREATE OR REPLACE FUNCTION hash_employee_password()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only hash if password_hash is being set and doesn't look like it's already hashed
    IF NEW.password_hash IS NOT NULL AND NEW.password_hash != OLD.password_hash THEN
        -- Check if it's already a bcrypt hash (starts with $2a$, $2b$, or $2y$)
        IF NEW.password_hash !~ '^\$2[aby]\$' THEN
            NEW.password_hash = hash_password(NEW.password_hash);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger to automatically hash passwords
CREATE TRIGGER hash_employee_password_trigger
    BEFORE INSERT OR UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION hash_employee_password();
