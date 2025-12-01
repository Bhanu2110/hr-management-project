-- Create employee_compensation table to store compensation history
CREATE TABLE IF NOT EXISTS public.employee_compensation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  ctc DECIMAL(12, 2) NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_employee_compensation_employee_id ON public.employee_compensation(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_compensation_effective_date ON public.employee_compensation(effective_date);

-- Enable Row Level Security
ALTER TABLE public.employee_compensation ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_compensation

-- Policy: Admins and HR can view all compensation records
CREATE POLICY "Admins and HR can view all compensation records"
ON public.employee_compensation
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE employees.user_id::text = auth.uid()::text
    AND employees.role IN ('admin', 'hr')
  )
);

-- Policy: Employees can view their own compensation records
CREATE POLICY "Employees can view own compensation records"
ON public.employee_compensation
FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees
    WHERE user_id::text = auth.uid()::text
  )
);

-- Policy: Admins and HR can insert compensation records
CREATE POLICY "Admins and HR can insert compensation records"
ON public.employee_compensation
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE employees.user_id::text = auth.uid()::text
    AND employees.role IN ('admin', 'hr')
  )
);

-- Policy: Admins and HR can update compensation records
CREATE POLICY "Admins and HR can update compensation records"
ON public.employee_compensation
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE employees.user_id::text = auth.uid()::text
    AND employees.role IN ('admin', 'hr')
  )
);

-- Policy: Admins and HR can delete compensation records
CREATE POLICY "Admins and HR can delete compensation records"
ON public.employee_compensation
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE employees.user_id::text = auth.uid()::text
    AND employees.role IN ('admin', 'hr')
  )
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_employee_compensation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employee_compensation_updated_at_trigger
BEFORE UPDATE ON public.employee_compensation
FOR EACH ROW
EXECUTE FUNCTION update_employee_compensation_updated_at();

-- Migrate existing compensation data from employees table
INSERT INTO public.employee_compensation (employee_id, ctc, effective_date)
SELECT 
  id,
  current_ctc,
  COALESCE(ctc_effective_date::date, hire_date::date)
FROM public.employees
WHERE current_ctc IS NOT NULL
ON CONFLICT DO NOTHING;
