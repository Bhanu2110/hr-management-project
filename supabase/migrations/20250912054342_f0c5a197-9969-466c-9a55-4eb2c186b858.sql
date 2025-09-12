-- Fix the handle_attendance function to not update generated column
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
    -- Get the most recent attendance record for the employee
    SELECT * INTO last_check
    FROM public.attendance
    WHERE public.attendance.employee_id = handle_attendance.employee_id
    ORDER BY check_in DESC
    LIMIT 1;

    -- If no check-in today or last action was check-out, create a new check-in
    IF last_check IS NULL OR last_check.check_out IS NOT NULL THEN
        INSERT INTO public.attendance (employee_id, status, check_in)
        VALUES (employee_id, 'checked_in', NOW())
        RETURNING jsonb_build_object(
            'action', 'checked_in',
            'time', check_in,
            'message', 'Checked in successfully'
        ) INTO result;
    
    -- If last action was check-in and it's from today, update with check-out
    ELSIF last_check.check_out IS NULL AND DATE(last_check.check_in) = CURRENT_DATE THEN
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
        -- Handle case where last check-in was on a previous day
        INSERT INTO public.attendance (employee_id, status, check_in)
        VALUES (employee_id, 'checked_in', NOW())
        RETURNING jsonb_build_object(
            'action', 'checked_in',
            'time', check_in,
            'message', 'Checked in for a new day'
        ) INTO result;
    END IF;

    RETURN result;

END;
$function$;