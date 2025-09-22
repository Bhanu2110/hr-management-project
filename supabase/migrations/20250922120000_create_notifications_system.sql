-- Create notifications table for admin notifications
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  related_table VARCHAR(100),
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Admins can view their own notifications
CREATE POLICY "Admins can view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (recipient_id IN (
  SELECT id FROM public.admins WHERE user_id = auth.uid()
));

-- Admins can update their own notifications (mark as read)
CREATE POLICY "Admins can update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (recipient_id IN (
  SELECT id FROM public.admins WHERE user_id = auth.uid()
));

-- Create function to notify all admins about new leave requests
CREATE OR REPLACE FUNCTION public.notify_admins_new_leave_request()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
  employee_name TEXT;
BEGIN
  -- Get employee name for the notification
  SELECT CONCAT(first_name, ' ', last_name) INTO employee_name
  FROM public.employees 
  WHERE id = NEW.employee_id;

  -- Insert notification for all admins
  FOR admin_record IN SELECT id FROM public.admins WHERE status = 'active'
  LOOP
    INSERT INTO public.notifications (
      recipient_id,
      title,
      message,
      type,
      related_table,
      related_id,
      action_url
    ) VALUES (
      admin_record.id,
      'New Leave Request',
      employee_name || ' has submitted a new ' || NEW.leave_type || ' request for ' || NEW.days || ' day(s)',
      'leave_request',
      'leave_requests',
      NEW.id,
      '/leave-requests'
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new leave requests
CREATE TRIGGER notify_admins_on_leave_request
  AFTER INSERT ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_new_leave_request();

-- Add updated_at trigger for notifications
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
