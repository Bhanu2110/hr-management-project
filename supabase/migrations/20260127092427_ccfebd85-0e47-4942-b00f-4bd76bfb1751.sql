-- Update the employee-documents bucket to allow Word documents (.doc, .docx)
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'application/pdf', 
  'image/jpeg', 
  'image/jpg', 
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]
WHERE id = 'employee-documents';