-- Create a function to delete auth user when employee is deleted
CREATE OR REPLACE FUNCTION delete_auth_user_on_employee_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the user from auth.users table
  DELETE FROM auth.users WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically delete auth user when employee is deleted
DROP TRIGGER IF EXISTS trigger_delete_auth_user ON employees;
CREATE TRIGGER trigger_delete_auth_user
  BEFORE DELETE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION delete_auth_user_on_employee_delete();
