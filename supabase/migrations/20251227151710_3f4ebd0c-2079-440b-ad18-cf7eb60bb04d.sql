-- Drop the foreign key constraint that limits notifications to admins only
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_recipient_id_fkey;

-- Now notifications can be sent to any UUID (admins or employees)