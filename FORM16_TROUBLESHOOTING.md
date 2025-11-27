# Form 16 Upload - Troubleshooting Guide

## Current Setup
✅ Supabase Storage bucket "documents" exists
✅ Form16Management component is ready
✅ API functions are created

## Troubleshooting Steps

### Step 1: Check Browser Console
1. Open your application
2. Press **F12** to open Developer Tools
3. Click on the **Console** tab
4. Try uploading a Form 16 file
5. Look for error messages (they will be in red)

### Step 2: Common Errors and Solutions

#### Error: "Bucket not found"
- **Solution**: The bucket name might be case-sensitive. Our code uses `documents` (lowercase).
- **Check**: Make sure the bucket is named exactly `documents` (all lowercase, no spaces)

#### Error: "new row violates row-level security policy"
- **Solution**: RLS policies are blocking the insert
- **Fix**: Go to Supabase → Storage → documents bucket → Policies
- Add these policies:

**Policy 1: Allow authenticated uploads**
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');
```

**Policy 2: Allow authenticated reads**
```sql
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');
```

**Policy 3: Allow authenticated deletes**
```sql
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');
```

#### Error: "Database error" or "form16_documents"
- **Solution**: RLS policies on the table might be blocking
- **Fix**: Go to Supabase → Table Editor → form16_documents → RLS
- Make sure admins can insert records

### Step 3: Quick Test

Try this in the browser console to test storage access:

```javascript
// Test if you can access storage
const { data, error } = await window.supabase.storage
  .from('documents')
  .list('form16', { limit: 1 });

console.log('Storage test:', { data, error });
```

### Step 4: Alternative - Disable RLS Temporarily

**WARNING: Only for testing!**

1. Go to Supabase → Storage → documents bucket
2. Click on "Policies"
3. Temporarily disable RLS or make the bucket fully public
4. Try uploading again
5. If it works, the issue is RLS policies

### Step 5: Check Authentication

Make sure you're logged in as an admin:

```javascript
// Check current user
const { data: { user } } = await window.supabase.auth.getUser();
console.log('Current user:', user);
```

## What to Share

Please share:
1. ✅ Screenshot of browser console errors
2. ✅ What user role you're logged in as (admin/employee)
3. ✅ Any red error messages from the console

This will help me identify the exact issue!
