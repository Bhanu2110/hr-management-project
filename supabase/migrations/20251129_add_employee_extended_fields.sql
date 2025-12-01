-- Add extended fields to employees table for enhanced employee management

-- Add document fields
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS aadhar_document_url TEXT,
ADD COLUMN IF NOT EXISTS pan_document_url TEXT,
ADD COLUMN IF NOT EXISTS salary_slip_url TEXT;

-- Add compensation fields
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS current_ctc DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS ctc_effective_date DATE;

-- Add bank details fields
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS ifsc_code TEXT,
ADD COLUMN IF NOT EXISTS branch_name TEXT,
ADD COLUMN IF NOT EXISTS account_holder_name TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.employees.aadhar_document_url IS 'URL to uploaded Aadhar card document in storage';
COMMENT ON COLUMN public.employees.pan_document_url IS 'URL to uploaded PAN card document in storage';
COMMENT ON COLUMN public.employees.salary_slip_url IS 'URL to uploaded salary slip document in storage';
COMMENT ON COLUMN public.employees.current_ctc IS 'Current Cost to Company in currency';
COMMENT ON COLUMN public.employees.ctc_effective_date IS 'Date from which the current CTC is effective';
COMMENT ON COLUMN public.employees.bank_name IS 'Name of the bank for salary transfer';
COMMENT ON COLUMN public.employees.account_number IS 'Bank account number';
COMMENT ON COLUMN public.employees.ifsc_code IS 'IFSC code of the bank branch';
COMMENT ON COLUMN public.employees.branch_name IS 'Name of the bank branch';
COMMENT ON COLUMN public.employees.account_holder_name IS 'Name of the account holder as per bank records';
