-- Drop the new attendance functions
DROP FUNCTION IF EXISTS public.handle_attendance(employee_id uuid);
DROP FUNCTION IF EXISTS public.get_attendance_status(employee_uuid uuid);

-- Restore the original handle_attendance trigger function
CREATE OR REPLACE FUNCTION public.handle_attendance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
begin
  -- If checking out, update the existing record
  if new.check_in is not null and new.check_out is not null then
    update public.attendance
    set 
      check_out = new.check_out,
      updated_at = now()
    where 
      employee_id = new.employee_id
      and date(check_in) = date(now())
      and check_out is null;
    
    return null;
  end if;
  
  -- If checking in, create a new record
  return new;
end;
$function$;