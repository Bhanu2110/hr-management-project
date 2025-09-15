-- Create admin record for the current user so they can access employee list
-- The user viratkohhli@gmail.com (user_id: bf397eda-8b5c-4f92-86bf-51f427dd8dc8) needs to be an admin
INSERT INTO public.admins (
  user_id, 
  admin_id, 
  first_name, 
  last_name, 
  email,
  position,
  department,
  status
) VALUES (
  'bf397eda-8b5c-4f92-86bf-51f427dd8dc8',
  'ADM001',
  'Virat',
  'Kohli', 
  'viratkohhli@gmail.com',
  'System Administrator',
  'IT',
  'active'
) ON CONFLICT (user_id) DO NOTHING;