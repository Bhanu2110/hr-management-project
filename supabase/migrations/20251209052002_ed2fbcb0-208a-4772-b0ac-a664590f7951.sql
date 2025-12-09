-- Add education certificate document columns to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS tenth_certificate_url text,
ADD COLUMN IF NOT EXISTS inter_certificate_url text,
ADD COLUMN IF NOT EXISTS degree_certificate_url text;

-- Add comments
COMMENT ON COLUMN public.employees.tenth_certificate_url IS 'URL to 10th class certificate document';
COMMENT ON COLUMN public.employees.inter_certificate_url IS 'URL to intermediate/12th class certificate document';
COMMENT ON COLUMN public.employees.degree_certificate_url IS 'URL to degree certificate document';