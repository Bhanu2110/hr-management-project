-- Add resume_url column to employees table for storing resume documents
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS resume_url text;