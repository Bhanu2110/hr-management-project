-- Create admin record for mahi@gmail.com user
INSERT INTO public.admins (
  user_id,
  admin_id,
  first_name,
  last_name,
  email,
  department,
  position,
  status
) VALUES (
  'b99cc414-a67f-4c46-94df-e367188c16f6',
  'ADM-MS-001',
  'Mahendra Singh',
  'Dhoni',
  'mahi@gmail.com',
  'Sports',
  'Captain',
  'active'
);