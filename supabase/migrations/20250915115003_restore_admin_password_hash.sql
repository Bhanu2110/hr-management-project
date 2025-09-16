-- Restore password_hash column to admins table
-- This adds back the password_hash column that was accidentally deleted

-- Add password_hash column back to admins table
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add comment to clarify the purpose
COMMENT ON COLUMN public.admins.password_hash IS 'Hashed password for admin authentication';

-- Update existing admins to have hashed passwords based on their plain text passwords
UPDATE public.admins 
SET password_hash = hash_password(COALESCE(password_plain, 'admin123'))
WHERE password_hash IS NULL;

-- Make password_hash NOT NULL after setting values
ALTER TABLE public.admins 
ALTER COLUMN password_hash SET NOT NULL;
