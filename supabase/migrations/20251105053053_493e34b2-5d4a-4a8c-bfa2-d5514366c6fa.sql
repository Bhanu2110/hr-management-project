-- Ensure RLS is enabled for attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Add FK from attendance.employee_id to employees.id if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'attendance_employee_fk'
  ) THEN
    ALTER TABLE public.attendance
    ADD CONSTRAINT attendance_employee_fk
    FOREIGN KEY (employee_id)
    REFERENCES public.employees(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Allow employees to INSERT their own attendance rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'attendance' AND policyname = 'Employees can insert own attendance'
  ) THEN
    CREATE POLICY "Employees can insert own attendance"
    ON public.attendance
    FOR INSERT
    WITH CHECK (
      employee_id IN (
        SELECT e.id FROM public.employees e WHERE e.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Allow admins to INSERT attendance rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'attendance' AND policyname = 'Admins can insert attendance'
  ) THEN
    CREATE POLICY "Admins can insert attendance"
    ON public.attendance
    FOR INSERT
    WITH CHECK (
      EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
    );
  END IF;
END $$;