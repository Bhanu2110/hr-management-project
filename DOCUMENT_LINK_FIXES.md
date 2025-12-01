# Document Link Fixes - Edit Employee Form

## Problem
When clicking on "View" for Aadhar, PAN, or Salary Slip in the Edit Employee form, users were encountering a "Bucket not found" (404) error. This was happening because the code was trying to access the files via direct public URLs, which rely on the bucket being public and properly configured, and the URLs stored in the database were pointing to a path that might not match the current bucket configuration or the bucket creation timing.

## Solution
Updated the document view logic in `EditEmployeeForm.tsx` for Aadhar, PAN, and Salary Slip to use **Signed URLs**.

### How it works now:
1.  **Extract File Path**: The code extracts the internal file path from the stored public URL.
2.  **Generate Signed URL**: It requests a temporary signed URL from Supabase Storage for that file path.
3.  **Open Signed URL**: It opens the generated signed URL in a new tab.

### Benefits:
*   **Reliability**: Signed URLs work even if the bucket is private (though we set it to public for other reasons), and they bypass some caching/configuration issues with direct public URLs.
*   **Security**: It's a more secure pattern for accessing user documents.
*   **Error Handling**: Added error handling to alert the user if the document cannot be loaded (e.g., if the file was deleted or the path is invalid).

## Files Modified
*   `src/components/employees/EditEmployeeForm.tsx`

## Verification
1.  Open the **Edit Employee** form for an employee with uploaded documents.
2.  Click the **View** link (or icon) for Aadhar, PAN, or Salary Slip.
3.  The document should open in a new tab without the 404 error.
