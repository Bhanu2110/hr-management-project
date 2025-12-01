-- ============================================
-- FIX SALARY SLIPS TABLE & SYNC DATA
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add file_url column to salary_slips if it doesn't exist
ALTER TABLE public.salary_slips 
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- 2. Sync existing salary slips from employees table to salary_slips table
-- This ensures employees who already have a slip uploaded will see it in their list
INSERT INTO public.salary_slips (
  employee_id,
  month,
  year,
  status,
  file_url,
  basic_salary,
  gross_earnings,
  net_salary,
  employee_name,
  employee_email,
  department,
  position,
  generated_date,
  pay_period_start,
  pay_period_end,
  working_days,
  present_days,
  hra,
  special_allowance,
  total_deductions,
  advance_deduction,
  esi_employee,
  esi_employer,
  income_tax,
  late_deduction,
  loan_deduction,
  medical_allowance,
  other_allowances,
  other_deductions,
  overtime_amount,
  overtime_hours,
  overtime_rate,
  performance_bonus,
  pf_employee,
  pf_employer,
  professional_tax,
  transport_allowance
)
SELECT 
  e.id,
  EXTRACT(MONTH FROM CURRENT_DATE), -- Default to current month
  EXTRACT(YEAR FROM CURRENT_DATE),  -- Default to current year
  'processed',
  e.salary_slip_url,
  COALESCE(e.current_ctc / 12 * 0.5, 0), -- Est. Basic (50% of monthly CTC)
  COALESCE(e.current_ctc / 12, 0),       -- Est. Gross
  COALESCE(e.current_ctc / 12, 0),       -- Est. Net
  e.first_name || ' ' || e.last_name,
  e.email,
  e.department,
  e.position,
  CURRENT_DATE,
  DATE_TRUNC('month', CURRENT_DATE),
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day'),
  30, -- Default working days
  30, -- Default present days
  COALESCE(e.current_ctc / 12 * 0.2, 0), -- Est. HRA
  COALESCE(e.current_ctc / 12 * 0.3, 0), -- Est. Special Allowance
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 -- Default 0 for others
FROM public.employees e
WHERE e.salary_slip_url IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM public.salary_slips s 
    WHERE s.employee_id = e.id AND s.file_url = e.salary_slip_url
  );

-- 3. Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'salary_slips' AND column_name = 'file_url';
