-- Make user_id column nullable in employees table
ALTER TABLE public.employees ALTER COLUMN user_id DROP NOT NULL;