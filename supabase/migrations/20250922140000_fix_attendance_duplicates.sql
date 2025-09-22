-- Fix attendance system to prevent duplicate check-ins per day
-- This migration addresses the issue where employees can check in multiple times per day

-- We'll rely on application logic and database functions to prevent duplicates
-- No complex constraints needed - the functions will handle validation

-- Create a function to check if employee can check in
CREATE OR REPLACE FUNCTION public.can_employee_check_in(emp_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    active_checkin RECORD;
BEGIN
    -- Check if there's an active check-in (no check-out) for today
    SELECT * INTO active_checkin
    FROM public.attendance
    WHERE employee_id = emp_id
      AND DATE(check_in) = CURRENT_DATE
      AND check_out IS NULL;
    
    -- If there's an active check-in, employee cannot check in again
    RETURN active_checkin IS NULL;
END;
$function$;

-- Create a function to check if employee can check out
CREATE OR REPLACE FUNCTION public.can_employee_check_out(emp_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    active_checkin RECORD;
BEGIN
    -- Check if there's an active check-in (no check-out) for today
    SELECT * INTO active_checkin
    FROM public.attendance
    WHERE employee_id = emp_id
      AND DATE(check_in) = CURRENT_DATE
      AND check_out IS NULL;
    
    -- Employee can only check out if there's an active check-in
    RETURN active_checkin IS NOT NULL;
END;
$function$;

-- Update the handle_attendance function with proper validation
CREATE OR REPLACE FUNCTION public.handle_attendance(employee_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    last_check RECORD;
    result JSONB;
    calculated_hours NUMERIC;
    update_count INTEGER;
BEGIN
    BEGIN
        -- Get the most recent attendance record for today
        SELECT * INTO last_check
        FROM public.attendance
        WHERE public.attendance.employee_id = handle_attendance.employee_id
          AND date_trunc('day', check_in) = date_trunc('day', NOW())
        ORDER BY check_in DESC
        LIMIT 1;

        -- If no check-in today, create a new check-in
        IF last_check IS NULL THEN
            INSERT INTO public.attendance (employee_id, status, check_in)
            VALUES (employee_id, 'checked_in', NOW());
            
            result := jsonb_build_object(
                'action', 'checked_in',
                'time', NOW(),
                'message', 'Checked in successfully'
            );
        
        -- If already checked in today and not checked out, do checkout
        ELSIF last_check.check_out IS NULL THEN
            -- Calculate hours worked
            calculated_hours := ROUND(EXTRACT(EPOCH FROM (NOW() - last_check.check_in)) / 3600, 2);
            
            -- Update the record with check_out time and status
            -- The total_hours will be computed by the database
            UPDATE public.attendance
            SET 
                check_out = NOW(),
                status = 'checked_out',
                updated_at = NOW()
            WHERE id = last_check.id;
            
            GET DIAGNOSTICS update_count = ROW_COUNT;
            
            IF update_count > 0 THEN
                result := jsonb_build_object(
                    'action', 'checked_out',
                    'time', NOW(),
                    'hours_worked', calculated_hours,
                    'message', 'Checked out successfully'
                );
            ELSE
                result := jsonb_build_object(
                    'error', true,
                    'message', 'Failed to update checkout record - no rows affected'
                );
            END IF;
        
        -- If already checked out today, prevent another action
        ELSIF last_check.check_out IS NOT NULL THEN
            result := jsonb_build_object(
                'error', true,
                'message', 'You have already completed your attendance for today. Please wait until tomorrow to check in again.'
            );
        
        ELSE
            result := jsonb_build_object(
                'error', true,
                'message', 'Unexpected state in attendance logic'
            );
        END IF;

    EXCEPTION
        WHEN OTHERS THEN
            result := jsonb_build_object(
                'error', true,
                'message', 'Database error: ' || SQLERRM,
                'sqlstate', SQLSTATE
            );
    END;

    RETURN result;
END;
$function$;

-- Update the get_attendance_status function to be more accurate
CREATE OR REPLACE FUNCTION public.get_attendance_status(employee_uuid uuid)
RETURNS TABLE(
  has_checked_in boolean,
  last_check_in timestamp with time zone,
  last_check_out timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    latest_record RECORD;
    completed_today RECORD;
BEGIN
    -- Get the most recent attendance record for today
    SELECT * INTO latest_record
    FROM public.attendance
    WHERE employee_id = employee_uuid
      AND DATE(check_in) = CURRENT_DATE
    ORDER BY check_in DESC
    LIMIT 1;

    -- If no record found for today
    IF latest_record IS NULL THEN
        RETURN QUERY SELECT 
            false as has_checked_in,
            NULL::timestamp with time zone as last_check_in,
            NULL::timestamp with time zone as last_check_out;
        RETURN;
    END IF;

    -- Return the status based on the latest record
    RETURN QUERY SELECT 
        (latest_record.check_out IS NULL) as has_checked_in,
        latest_record.check_in as last_check_in,
        latest_record.check_out as last_check_out;
END;
$function$;

-- Clean up any duplicate attendance records that might exist
-- This will keep only the first check-in of each day and remove duplicates
WITH ranked_attendance AS (
    SELECT id, 
           ROW_NUMBER() OVER (
               PARTITION BY employee_id, DATE(check_in) 
               ORDER BY check_in ASC
           ) as rn
    FROM public.attendance
)
DELETE FROM public.attendance 
WHERE id IN (
    SELECT id FROM ranked_attendance WHERE rn > 1
);

-- Add a comment to the attendance table
COMMENT ON TABLE public.attendance IS 'Employee attendance records with application-level validation to prevent duplicate check-ins per day';
