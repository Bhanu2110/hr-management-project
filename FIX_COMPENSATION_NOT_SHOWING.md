# URGENT: Steps to Fix Compensation Records Not Showing

## The Problem
You're only seeing 1 compensation record in the edit form instead of all the records you added.

## Root Cause
The `employee_compensation` table doesn't exist in your Supabase database yet, so the records are not being saved there.

## Solution - Follow These Steps:

### Step 1: Run the SQL Migration

1. Open Supabase Dashboard (https://supabase.com/dashboard)
2. Go to your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the ENTIRE contents of this file:
   ```
   supabase/migrations/20251130_create_employee_compensation_table.sql
   ```
6. Paste it into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. You should see "Success. No rows returned"

### Step 2: Verify the Table Was Created

1. In Supabase, click on **Table Editor** in the left sidebar
2. Look for a table called `employee_compensation`
3. It should have columns: `id`, `employee_id`, `ctc`, `effective_date`, `created_at`, `updated_at`

### Step 3: Re-add the Employee (or Update Existing)

**Option A: Add a New Employee**
1. Go to your app
2. Click "Add Employee"
3. Fill in the details
4. Add multiple compensation records (e.g., 3 different CTCs)
5. Submit the form
6. Check Supabase `employee_compensation` table - you should see all records

**Option B: Update Existing Employee**
1. Go to your app
2. Click "Edit" on the employee
3. Add more compensation records in the table
4. Click "Update Employee"
5. Check Supabase `employee_compensation` table - you should see all records

### Step 4: Verify It's Working

1. Edit the employee again
2. Open browser console (F12)
3. Look for console logs:
   ```
   Loading compensation records for employee: [uuid]
   Compensation query result: { data: [...], error: null }
   Found X compensation records in database
   ```
4. You should see ALL your compensation records in the table

## Debugging

If you still only see 1 record:

### Check 1: Did the SQL migration run successfully?
- Go to Supabase → Table Editor
- Look for `employee_compensation` table
- If it doesn't exist, the migration didn't run

### Check 2: Are records being saved?
- Add a new employee with 3 compensation records
- Go to Supabase → Table Editor → `employee_compensation`
- Click "View all rows"
- You should see 3 rows for that employee

### Check 3: Check browser console
- Open the edit form
- Press F12 to open browser console
- Look for the console logs I added
- If you see "No compensation records in database", it means:
  - Either the table doesn't exist
  - Or the records weren't saved
  - Or there's an RLS policy blocking the query

### Check 4: Check for errors
- Look in the browser console for any red errors
- Common errors:
  - "relation employee_compensation does not exist" → Run the SQL migration
  - "permission denied" → RLS policy issue
  - "column does not exist" → Table structure issue

## Quick Test

Run this query in Supabase SQL Editor to check if records exist:

```sql
SELECT 
  e.employee_id,
  e.first_name,
  e.last_name,
  ec.ctc,
  ec.effective_date
FROM employees e
LEFT JOIN employee_compensation ec ON e.id = ec.employee_id
ORDER BY e.employee_id, ec.effective_date;
```

If you see NULL values in the `ctc` and `effective_date` columns, it means the records weren't saved to the `employee_compensation` table.

## Still Not Working?

Share the following information:
1. Screenshot of Supabase Table Editor showing the `employee_compensation` table
2. Screenshot of browser console when you open the edit form
3. Result of the SQL query above
