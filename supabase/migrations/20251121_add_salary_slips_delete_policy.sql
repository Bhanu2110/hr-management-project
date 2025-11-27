-- Add DELETE policy for salary_slips table to allow admins to delete salary slips

CREATE POLICY "Admins can delete salary slips" ON salary_slips
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() IN (SELECT user_id FROM public.admins)
  );
