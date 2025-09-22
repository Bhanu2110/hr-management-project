-- Create the missing get_attendance_status function
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

-- Fix the handle_attendance function to handle checkout properly
CREATE OR REPLACE FUNCTION public.handle_attendance(employee_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    last_check RECORD;
    result JSONB;
    calculated_hours NUMERIC;
BEGIN
    -- Get the most recent attendance record for today
    SELECT * INTO last_check
    FROM public.attendance
    WHERE public.attendance.employee_id = handle_attendance.employee_id
      AND DATE(check_in) = CURRENT_DATE
    ORDER BY check_in DESC
    LIMIT 1;

    -- If no check-in today, create a new check-in
    IF last_check IS NULL THEN
        INSERT INTO public.attendance (employee_id, status, check_in)
        VALUES (employee_id, 'checked_in', NOW())
        RETURNING jsonb_build_object(
            'action', 'checked_in',
            'time', check_in,
            'message', 'Checked in successfully'
        ) INTO result;
    
    -- If already checked in today and not checked out, do checkout
    ELSIF last_check.check_out IS NULL THEN
        -- Calculate hours worked
        calculated_hours := ROUND(EXTRACT(EPOCH FROM (NOW() - last_check.check_in)) / 3600, 2);
        
        UPDATE public.attendance
        SET 
            check_out = NOW(),
            status = 'checked_out',
            updated_at = NOW()
        WHERE id = last_check.id
        RETURNING jsonb_build_object(
            'action', 'checked_out',
            'time', check_out,
            'hours_worked', calculated_hours,
            'message', 'Checked out successfully'
        ) INTO result;
        
        IF NOT FOUND THEN
            result := jsonb_build_object(
                'error', true,
                'message', 'No matching record to check out'
            );
        END IF;
    ELSE
        -- Already checked out today, create new check-in
        INSERT INTO public.attendance (employee_id, status, check_in)
        VALUES (employee_id, 'checked_in', NOW())
        RETURNING jsonb_build_object(
            'action', 'checked_in',
            'time', check_in,
            'message', 'Checked in for new session'
        ) INTO result;
    END IF;

    RETURN result;

END;
$function$;
