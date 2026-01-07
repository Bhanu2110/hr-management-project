-- Allow employees to upload their own documents into the employee-documents bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Employees can upload own employee documents'
  ) THEN
    CREATE POLICY "Employees can upload own employee documents"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'employee-documents'
      AND EXISTS (
        SELECT 1
        FROM public.employees e
        WHERE e.user_id = auth.uid()
      )
      AND name LIKE '%' || (
        SELECT e.employee_id
        FROM public.employees e
        WHERE e.user_id = auth.uid()
        LIMIT 1
      ) || '%'
    );
  END IF;
END $$;
