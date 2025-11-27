-- Create form16_records table
CREATE TABLE IF NOT EXISTS public.form16_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES public.employees(employee_id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    employee_email TEXT NOT NULL,
    pan_number TEXT,
    
    -- Year Information
    assessment_year TEXT NOT NULL,
    financial_year TEXT NOT NULL,
    
    -- Employer Information
    employer_name TEXT NOT NULL DEFAULT 'Tech Solutions Pvt Ltd',
    employer_address TEXT NOT NULL DEFAULT '123 Business Park, Tech City',
    employer_tan TEXT NOT NULL DEFAULT 'ABCD12345E',
    
    -- Salary Components
    basic_salary DECIMAL(12, 2) NOT NULL DEFAULT 0,
    hra DECIMAL(12, 2) NOT NULL DEFAULT 0,
    special_allowance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    other_allowances DECIMAL(12, 2) NOT NULL DEFAULT 0,
    gross_salary DECIMAL(12, 2) GENERATED ALWAYS AS (basic_salary + hra + special_allowance + other_allowances) STORED,
    
    -- Deductions
    pf_employee DECIMAL(12, 2) NOT NULL DEFAULT 0,
    pf_employer DECIMAL(12, 2) NOT NULL DEFAULT 0,
    esi_employee DECIMAL(12, 2) NOT NULL DEFAULT 0,
    esi_employer DECIMAL(12, 2) NOT NULL DEFAULT 0,
    professional_tax DECIMAL(12, 2) NOT NULL DEFAULT 0,
    other_deductions DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_deductions DECIMAL(12, 2) GENERATED ALWAYS AS (pf_employee + esi_employee + professional_tax + other_deductions) STORED,
    
    -- Tax Calculations
    taxable_income DECIMAL(12, 2) NOT NULL DEFAULT 0,
    income_tax DECIMAL(12, 2) NOT NULL DEFAULT 0,
    education_cess DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_tax DECIMAL(12, 2) GENERATED ALWAYS AS (income_tax + education_cess) STORED,
    tds_deducted DECIMAL(12, 2) NOT NULL DEFAULT 0,
    
    -- Additional Details
    exemptions_claimed DECIMAL(12, 2) NOT NULL DEFAULT 0,
    standard_deduction DECIMAL(12, 2) NOT NULL DEFAULT 50000,
    previous_employer_details TEXT,
    
    -- Status and Metadata
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'issued')),
    generated_date TIMESTAMPTZ,
    issued_date TIMESTAMPTZ,
    pdf_url TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT,
    updated_by TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_form16_employee_id ON public.form16_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_form16_assessment_year ON public.form16_records(assessment_year);
CREATE INDEX IF NOT EXISTS idx_form16_status ON public.form16_records(status);
CREATE INDEX IF NOT EXISTS idx_form16_created_at ON public.form16_records(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.form16_records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Employees can view their own Form 16" ON public.form16_records;
DROP POLICY IF EXISTS "Admins can view all Form 16 records" ON public.form16_records;
DROP POLICY IF EXISTS "Admins can insert Form 16 records" ON public.form16_records;
DROP POLICY IF EXISTS "Admins can update Form 16 records" ON public.form16_records;
DROP POLICY IF EXISTS "Admins can delete Form 16 records" ON public.form16_records;

-- RLS Policies
-- Employees can view their own Form 16 records
CREATE POLICY "Employees can view their own Form 16"
    ON public.form16_records
    FOR SELECT
    USING (
        employee_id = (SELECT employee_id FROM public.employees WHERE id = auth.uid())
    );

-- Admins can view all Form 16 records
CREATE POLICY "Admins can view all Form 16 records"
    ON public.form16_records
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can insert Form 16 records
CREATE POLICY "Admins can insert Form 16 records"
    ON public.form16_records
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update Form 16 records
CREATE POLICY "Admins can update Form 16 records"
    ON public.form16_records
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can delete Form 16 records
CREATE POLICY "Admins can delete Form 16 records"
    ON public.form16_records
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_form16_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_form16_records_updated_at ON public.form16_records;
CREATE TRIGGER update_form16_records_updated_at
    BEFORE UPDATE ON public.form16_records
    FOR EACH ROW
    EXECUTE FUNCTION update_form16_updated_at();

-- Add comment to table
COMMENT ON TABLE public.form16_records IS 'Stores Form 16 tax certificates for employees';
