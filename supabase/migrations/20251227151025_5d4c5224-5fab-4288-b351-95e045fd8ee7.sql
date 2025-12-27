-- Add INSERT policy for notifications table so admins can create notifications for employees
CREATE POLICY "Admins can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
    )
);

-- Add DELETE policy for notifications so employees can delete their own notifications
CREATE POLICY "Users can delete own notifications" 
ON public.notifications 
FOR DELETE 
USING (
    recipient_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid()
    ) OR 
    recipient_id IN (
        SELECT id FROM admins WHERE user_id = auth.uid()
    )
);