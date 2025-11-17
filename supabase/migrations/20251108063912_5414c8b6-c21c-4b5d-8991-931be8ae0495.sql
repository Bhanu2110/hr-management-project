-- Add medical_insurance column to salary_structures table
ALTER TABLE public.salary_structures
ADD COLUMN medical_insurance numeric NOT NULL DEFAULT 0;

-- Add medical_insurance column to salary_slips table
ALTER TABLE public.salary_slips
ADD COLUMN medical_insurance numeric NOT NULL DEFAULT 0;