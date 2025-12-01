# Salary Slip Deletion Issue - Troubleshooting Guide

## Problem
Unable to delete salary slips from the admin side.

## Root Cause
The issue is likely due to missing or improperly configured Row Level Security (RLS) policies in Supabase for the `salary_slips` table.

## Solution Steps

### Step 1: Apply the RLS DELETE Policy in Supabase

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Run the following SQL script:

```sql
-- Fix salary slips deletion issue for admins
-- This script ensures admins can delete salary slips

-- First, drop the existing delete policy if it exists
DROP POLICY IF EXISTS "Admins can delete salary slips" ON salary_slips;

-- Create a new DELETE policy for admins
CREATE POLICY "Admins can delete salary slips" ON salary_slips
  FOR DELETE 
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid() IN (SELECT user_id FROM public.admins)
  );
```

4. Click "Run" to execute the script

### Step 2: Verify the Policy

After running the script, verify the policy was created:

```sql
-- View all policies on the salary_slips table
SELECT * FROM pg_policies WHERE tablename = 'salary_slips';
```

You should see a policy named "Admins can delete salary slips" with command = 'DELETE'.

### Step 3: Test the Delete Functionality

1. Log in as an admin
2. Navigate to the Salary Slips page
3. Try to delete a salary slip by clicking the trash icon
4. Open the browser console (F12) to see detailed error messages

### Step 4: Check Console Logs

The delete function now includes detailed logging. When you attempt to delete, check the console for:
- "Attempting to delete salary slip with ID: ..."
- If successful: "Delete successful, deleted data: ..."
- If failed: Detailed error message

### Common Error Messages and Solutions

#### Error: "Permission denied" or policy-related error
**Solution**: The RLS policy isn't applied or your user isn't in the admins table.
- Verify you're logged in as an admin
- Check that your user_id exists in the `admins` table:
  ```sql
  SELECT * FROM public.admins WHERE user_id = auth.uid();
  ```

#### Error: "PGRST116" or "not found"
**Solution**: The salary slip doesn't exist or was already deleted.
- Refresh the page to see the current list

#### Error: "Failed to delete salary slip: Unknown error"
**Solution**: Check Supabase logs for more details
- Go to Supabase Dashboard → Logs → API
- Look for DELETE requests to salary_slips table

### Step 5: Verify Admin Status

Make sure you're logged in as an admin:

```sql
-- Check if current user is an admin
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role,
  EXISTS(SELECT 1 FROM public.admins WHERE user_id = auth.uid()) as is_admin;
```

If `is_admin` is `false`, you need to add your user to the admins table.

### Additional Debugging

If the issue persists, check:

1. **RLS is enabled on the table**:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'salary_slips';
   ```
   `rowsecurity` should be `true`.

2. **All existing policies**:
   ```sql
   SELECT policyname, cmd, qual, with_check 
   FROM pg_policies 
   WHERE tablename = 'salary_slips';
   ```

3. **Your admin record**:
   ```sql
   SELECT * FROM public.admins WHERE email = 'your-email@example.com';
   ```

## Files Modified

- `FIX_SALARY_SLIPS_DELETE.sql` - SQL script to fix the RLS policy
- `src/components/salary/SalaryManagement.tsx` - Already has delete functionality with proper error handling

## Notes

- The delete button is already implemented in the UI (trash icon in the actions column)
- The `handleDeleteSalarySlip` function is already present and functional
- The issue is purely related to Supabase RLS policies, not the frontend code

## Contact

If you continue to experience issues after following these steps, please check:
1. Browser console for detailed error messages
2. Supabase logs for API errors
3. Network tab to see the actual DELETE request and response
