-- Change days column from integer to numeric to support half-day leave (0.5)
ALTER TABLE public.leave_requests 
ALTER COLUMN days TYPE numeric USING days::numeric;

-- Add a check constraint to ensure valid values (full day = 1, half day = 0.5, or multiples)
ALTER TABLE public.leave_requests 
ADD CONSTRAINT valid_leave_days CHECK (days > 0 AND (days * 2) = FLOOR(days * 2));