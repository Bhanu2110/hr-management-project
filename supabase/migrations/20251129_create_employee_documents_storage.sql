-- Create storage bucket for employee documents (Aadhar, PAN, Salary Slips)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'employee-documents',
  'employee-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for employee-documents bucket

-- Admins can upload employee documents
CREATE POLICY "Admins can upload employee documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'employee-documents' AND
    EXISTS (
      SELECT 1 FROM employees WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can view all employee documents
CREATE POLICY "Admins can view all employee documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'employee-documents' AND
    EXISTS (
      SELECT 1 FROM employees WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Employees can view their own documents
CREATE POLICY "Employees can view their own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'employee-documents' AND
    (
      -- Check if the file path contains the employee's ID
      name LIKE '%' || (SELECT employee_id FROM employees WHERE user_id = auth.uid()) || '%'
    )
  );

-- Admins can update employee documents
CREATE POLICY "Admins can update employee documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'employee-documents' AND
    EXISTS (
      SELECT 1 FROM employees WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete employee documents
CREATE POLICY "Admins can delete employee documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'employee-documents' AND
    EXISTS (
      SELECT 1 FROM employees WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
