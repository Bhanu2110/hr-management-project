-- Add password_plain column to employees table to store original password (like admins table)
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS password_plain text;

-- Update existing employees to set password_plain from password_hash if it looks like a plain text password
-- (This is just for existing records, new ones will be set properly)