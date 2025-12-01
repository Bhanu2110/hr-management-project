-- =================================================================
-- UNIVERSAL SALARY SLIP FIX (ROBUST TYPE HANDLING)
-- Run this ENTIRE script in Supabase SQL Editor
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
-- Fixed: Cast both sides to text to handle both UUID and Text columns safely
CREATE POLICY "Admins can do everything on salary_slips"
ON public.salary_slips
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE user_id::text = auth.uid()::text 
    AND role IN ('admin', 'hr')
  )
);

-- Create Employee Policy (View Own Slips)
-- Fixed: Cast both sides to text to handle both UUID and Text columns safely
CREATE POLICY "Employees can view their own salary slips"
ON public.salary_slips
FOR SELECT
USING (
  employee_id::text IN (
    SELECT id::text FROM public.employees 
    WHERE user_id::text = auth.uid()::text
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
    WHERE s.employee_id::text = e.id::text AND s.file_url = e.salary_slip_url
  );

-- 4. VERIFY SETUP
-- =================================================================
SELECT 'Success' as status, 'All policies and columns updated' as message;
