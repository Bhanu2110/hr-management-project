-- =================================================================
-- COMPLETE SALARY SLIP SETUP SCRIPT
-- Run this ENTIRE script in Supabase SQL Editor to fix everything
-- =================================================================

-- 1. ADD MISSING COLUMN
-- =================================================================
ALTER TABLE public.salary_slips 
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- 2. SETUP PERMISSIONS (RLS)
-- =================================================================
-- Enable RLS
ALTER TABLE public.salary_slips ENABLE ROW LEVEL SECURITY;

-- Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can do everything on salary_slips" ON public.salary_slips;
DROP POLICY IF EXISTS "Employees can view their own salary slips" ON public.salary_slips;
DROP POLICY IF EXISTS "Admins can delete salary slips" ON public.salary_slips;

-- Create Admin Policy (Full Access)
CREATE POLICY "Admins can do everything on salary_slips"
ON public.salary_slips
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr')
  )
);

-- Create Employee Policy (View Own Slips)
CREATE POLICY "Employees can view their own salary slips"
ON public.salary_slips
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE user_id = auth.uid()
  )
);

-- 3. SYNC EXISTING DATA
-- =================================================================
-- This makes sure employees who already have a slip uploaded see it in the list
INSERT INTO public.salary_slips (
  employee_id, month, year, status, file_url, 
  basic_salary, gross_earnings, net_salary, 
  employee_name, employee_email, department, position,
  generated_date, pay_period_start, pay_period_end,
  working_days, present_days, hra, special_allowance,
  total_deductions, advance_deduction, esi_employee, esi_employer, 
  income_tax, late_deduction, loan_deduction, medical_allowance, 
  other_allowances, other_deductions, overtime_amount, overtime_hours, 
  overtime_rate, performance_bonus, pf_employee, pf_employer, 
  professional_tax, transport_allowance
)
SELECT 
  e.id,
  EXTRACT(MONTH FROM CURRENT_DATE),
  EXTRACT(YEAR FROM CURRENT_DATE),
  'processed',
  e.salary_slip_url,
  COALESCE(e.current_ctc / 12 * 0.5, 0),
  COALESCE(e.current_ctc / 12, 0),
  COALESCE(e.current_ctc / 12, 0),
  e.first_name || ' ' || e.last_name,
  e.email, e.department, e.position,
  CURRENT_DATE, DATE_TRUNC('month', CURRENT_DATE), (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day'),
  30, 30, COALESCE(e.current_ctc / 12 * 0.2, 0), COALESCE(e.current_ctc / 12 * 0.3, 0),
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM public.employees e
WHERE e.salary_slip_url IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM public.salary_slips s 
    WHERE s.employee_id = e.id AND s.file_url = e.salary_slip_url
  );

-- 4. VERIFY SETUP
-- =================================================================
SELECT 'Column Exists' as check_type, column_name 
FROM information_schema.columns 
WHERE table_name = 'salary_slips' AND column_name = 'file_url'
UNION ALL
SELECT 'Policy Exists', policyname 
FROM pg_policies 
WHERE tablename = 'salary_slips';
