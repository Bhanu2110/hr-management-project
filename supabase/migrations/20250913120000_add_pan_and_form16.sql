-- Add PAN field to employees table
ALTER TABLE employees ADD COLUMN pan_number VARCHAR(10) UNIQUE;

-- Create Form 16 documents table
CREATE TABLE form16_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    uploaded_by UUID REFERENCES admins(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    financial_year VARCHAR(9) NOT NULL, -- e.g., "2023-2024"
    quarter VARCHAR(10), -- e.g., "Q1", "Q2", "Q3", "Q4"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_form16_employee_id ON form16_documents(employee_id);
CREATE INDEX idx_form16_financial_year ON form16_documents(financial_year);

-- Add RLS policies for Form 16 documents
ALTER TABLE form16_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Employees can only view their own Form 16 documents
CREATE POLICY "Employees can view own form16 documents" ON form16_documents
    FOR SELECT USING (
        employee_id IN (
            SELECT id FROM employees WHERE user_id = auth.uid()
        )
    );

-- Policy: Admins can view and manage all Form 16 documents
CREATE POLICY "Admins can manage all form16 documents" ON form16_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins WHERE user_id = auth.uid()
        )
    );

-- Update employees table to make PAN case-insensitive
CREATE OR REPLACE FUNCTION normalize_pan() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.pan_number IS NOT NULL THEN
        NEW.pan_number = UPPER(NEW.pan_number);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER normalize_pan_trigger
    BEFORE INSERT OR UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION normalize_pan();
