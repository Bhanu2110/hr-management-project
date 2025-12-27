-- Add policies for employees to view and update their own notifications
CREATE POLICY "Employees can view own notifications" 
ON public.notifications 
FOR SELECT 
USING (
    recipient_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Employees can update own notifications" 
ON public.notifications 
FOR UPDATE 
USING (
    recipient_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid()
    )
);