-- Enable RLS (idempotent)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Allow admins to UPDATE employees
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'employees' 
      AND policyname = 'Admins can update employees'
  ) THEN
    CREATE POLICY "Admins can update employees"
    ON public.employees
    FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid()));
  END IF;
END $$;

-- Allow admins to INSERT employees
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'employees' 
      AND policyname = 'Admins can insert employees'
  ) THEN
    CREATE POLICY "Admins can insert employees"
    ON public.employees
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid()));
  END IF;
END $$;

-- Allow admins to DELETE employees
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'employees' 
      AND policyname = 'Admins can delete employees'
  ) THEN
    CREATE POLICY "Admins can delete employees"
    ON public.employees
    FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid()));
  END IF;
END $$;

-- Auto-update updated_at on employees
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_employees_updated_at'
  ) THEN
    CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;