-- Update all existing employee passwords to use their PAN number
-- This enables passwordless login using just PAN number

-- Create a function to update employee passwords
CREATE OR REPLACE FUNCTION update_employee_passwords_to_pan()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    emp_record RECORD;
BEGIN
    -- Loop through all employees and update their auth passwords to their PAN number
    FOR emp_record IN 
        SELECT e.user_id, e.pan_number, e.email
        FROM employees e
        WHERE e.user_id IS NOT NULL AND e.pan_number IS NOT NULL
    LOOP
        -- Update the auth.users password to be the PAN number
        UPDATE auth.users 
        SET encrypted_password = crypt(emp_record.pan_number, gen_salt('bf'))
        WHERE id = emp_record.user_id;
        
        RAISE NOTICE 'Updated password for employee with PAN: %', emp_record.pan_number;
    END LOOP;
END;
$$;

-- Execute the function to update all existing employee passwords
SELECT update_employee_passwords_to_pan();

-- Drop the function after use
DROP FUNCTION update_employee_passwords_to_pan();
