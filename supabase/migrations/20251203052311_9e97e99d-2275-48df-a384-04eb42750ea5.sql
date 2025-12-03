-- Add PF, UAN, and ESI fields to employees table
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS pf_number text,
ADD COLUMN IF NOT EXISTS uan_number text,
ADD COLUMN IF NOT EXISTS esi_number text;