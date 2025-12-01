# Troubleshooting Guide - Employee Form Issues

## Issue 1: Document URLs showing as NULL

### Problem
When uploading Aadhar, PAN, or Salary Slip documents, the URLs are saved as NULL in the database.

### Cause
The `employee-documents` storage bucket hasn't been created yet in your Supabase project.

### Solution

**Step 1: Apply Database Migrations**

You need to run the SQL migrations to create the storage bucket and add the new columns.

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the contents of `supabase/migrations/20251129_add_employee_extended_fields.sql`
6. Click **Run** or press `Ctrl+Enter`
7. Create another new query
8. Copy and paste the contents of `supabase/migrations/20251129_create_employee_documents_storage.sql`
9. Click **Run** or press `Ctrl+Enter`

**Option B: Using Supabase CLI**

If you have Supabase CLI installed:
```bash
supabase db push
```

**Step 2: Verify Storage Bucket**

1. In Supabase Dashboard, go to **Storage** (left sidebar)
2. You should see a bucket named `employee-documents`
3. If it's not there, manually create it:
   - Click **New Bucket**
   - Name: `employee-documents`
   - Public: **OFF** (unchecked)
   - File size limit: 10MB
   - Allowed MIME types: `application/pdf`, `image/jpeg`, `image/jpg`, `image/png`

**Step 3: Verify Policies**

1. In Storage > employee-documents bucket
2. Click on **Policies** tab
3. You should see policies for:
   - Admins can upload employee documents
   - Admins can view all employee documents
   - Employees can view their own documents
   - Admins can update employee documents
   - Admins can delete employee documents

If policies are missing, run the storage migration SQL again.

---

## Issue 2: Password field showing as empty in Supabase

### This is NORMAL and EXPECTED behavior!

**Why?**
- Passwords are **NOT** stored in the `employees` table
- Passwords are stored securely in **Supabase Auth** system
- The `password_hash` field in the employees table is just a placeholder to satisfy the NOT NULL constraint

**Where is the password stored?**
1. Go to Supabase Dashboard
2. Navigate to **Authentication** > **Users** (left sidebar)
3. You'll see all users with their emails
4. The password is stored securely (hashed) in the Auth system, not visible in the database

**How to verify the password works?**
- Try logging in with the employee's email and the password you set
- If login works, the password is correctly stored in Supabase Auth ✅

---

## Issue 3: Employee can login but doesn't show in Supabase employees table

### Possible Causes & Solutions

**Cause 1: Looking in the wrong place**
- Check **Authentication** > **Users** - This shows auth users
- Check **Table Editor** > **employees** - This shows employee records
- Both should have entries

**Cause 2: RLS (Row Level Security) policies**
- You might be logged in as an employee, not admin
- Employees can only see their own record
- Admins can see all records

**Solution:**
1. Make sure you're logged in as an **admin** user
2. Go to **Table Editor** > **employees**
3. You should see all employee records

**Cause 3: Database error during employee creation**
- Check browser console for errors
- Look for red error messages when submitting the form

---

## Quick Verification Checklist

After applying migrations, verify:

- [ ] Storage bucket `employee-documents` exists
- [ ] Storage policies are in place
- [ ] New columns exist in employees table:
  - [ ] aadhar_document_url
  - [ ] pan_document_url
  - [ ] salary_slip_url
  - [ ] current_ctc
  - [ ] ctc_effective_date
  - [ ] bank_name
  - [ ] account_number
  - [ ] ifsc_code
  - [ ] branch_name
  - [ ] account_holder_name
- [ ] Can upload files without errors
- [ ] Document URLs are saved (not NULL)
- [ ] Employee can login with created password
- [ ] Employee record appears in employees table

---

## Testing the Fix

1. **Apply the migrations** (see Step 1 above)
2. **Refresh your application**
3. **Add a new employee** with documents
4. **Check the browser console** for any errors
5. **Verify in Supabase**:
   - Authentication > Users (should show the user)
   - Table Editor > employees (should show employee with document URLs)
   - Storage > employee-documents (should show uploaded files)

---

## Common Errors & Solutions

### Error: "Bucket not found"
**Solution:** Create the storage bucket manually or run the storage migration

### Error: "new row violates row-level security policy"
**Solution:** Make sure you're logged in as an admin when adding employees

### Error: "column does not exist"
**Solution:** Run the database migration to add new columns

### Files upload but URLs are NULL
**Solution:** Check if the bucket is public or if policies allow reading the URLs

---

## Need More Help?

If issues persist:
1. Check browser console for JavaScript errors
2. Check Supabase logs in Dashboard > Logs
3. Verify you're logged in as admin
4. Make sure migrations were applied successfully
