# Document Management - Supabase Integration Guide

## Overview
This guide will help you convert the static document management system to use dynamic data from Supabase.

## What Has Been Done

### 1. Created API Functions (`src/api/documents.ts`)
- `fetchAllDocuments()` - Get all documents (admin)
- `fetchEmployeeDocuments()` - Get documents for specific employee
- `uploadDocument()` - Upload new document with file to storage
- `updateDocument()` - Update document metadata
- `deleteDocument()` - Delete document and file
- `downloadDocument()` - Download document file
- `approveDocument()` - Approve pending document
- `rejectDocument()` - Reject pending document
- `getDocumentStatistics()` - Get document stats

### 2. Updated Admin Component (`src/components/documents/AdminDocumentManagement.tsx`)
- Added imports for API functions
- Added state management for loading, documents, and stats
- Added `useEffect` to fetch data on mount
- Added `loadDocuments()` and `loadStatistics()` functions
- Ready to replace mock data with real data

### 3. Created Database Schema (`database/create_documents_table.sql`)
- Complete SQL script to create `documents` table
- Includes all necessary columns for document management
- Indexes for performance
- Row Level Security (RLS) policies for access control

## Steps to Complete Integration

### Step 1: Create the Documents Table in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `database/create_documents_table.sql`
5. Click **Run** to execute the SQL

### Step 2: Update Supabase Types (Optional but Recommended)

After creating the table, regenerate your Supabase types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID.

### Step 3: Remove Mock Data

In `src/components/documents/AdminDocumentManagement.tsx`, you need to:

1. **Remove the mock data** (lines 127-363 approximately):
   - Delete the entire `mockDocuments` array
   
2. **Update the filtered documents** to use real data:
   - Change `mockDocuments.filter` to `documents.filter`

3. **Remove the duplicate stats calculation** (around line 502):
   - Delete the stats calculation that uses `mockDocuments`
   - Keep only the `stats` state that gets populated from `loadStatistics()`

### Step 4: Update Handler Functions

Replace the console.log handlers with real API calls:

```typescript
const handleUpload = async () => {
    if (!uploadData.title || !uploadData.file) {
        toast({
            title: "Error",
            description: "Please fill in all required fields",
            variant: "destructive",
        });
        return;
    }

    try {
        setIsUploading(true);
        await uploadDocument(uploadData as DocumentUploadRequest);
        
        toast({
            title: "Success",
            description: "Document uploaded successfully",
        });
        
        setIsUploadDialogOpen(false);
        resetUploadData();
        
        // Reload data
        await loadDocuments();
        await loadStatistics();
    } catch (error) {
        console.error('Error uploading document:', error);
        toast({
            title: "Error",
            description: "Failed to upload document",
            variant: "destructive",
        });
    } finally {
        setIsUploading(false);
    }
};

const handleApprove = async (id: string) => {
    try {
        await approveDocument(id, "Admin"); // Replace with actual admin name
        toast({
            title: "Success",
            description: "Document approved successfully",
        });
        await loadDocuments();
        await loadStatistics();
    } catch (error) {
        console.error('Error approving document:', error);
        toast({
            title: "Error",
            description: "Failed to approve document",
            variant: "destructive",
        });
    }
};

const handleReject = async (id: string) => {
    try {
        await rejectDocument(id, "Admin"); // Replace with actual admin name
        toast({
            title: "Success",
            description: "Document rejected successfully",
        });
        await loadDocuments();
        await loadStatistics();
    } catch (error) {
        console.error('Error rejecting document:', error);
        toast({
            title: "Error",
            description: "Failed to reject document",
            variant: "destructive",
        });
    }
};

const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
        return;
    }

    try {
        await deleteDocument(id);
        toast({
            title: "Success",
            description: "Document deleted successfully",
        });
        await loadDocuments();
        await loadStatistics();
    } catch (error) {
        console.error('Error deleting document:', error);
        toast({
            title: "Error",
            description: "Failed to delete document",
            variant: "destructive",
        });
    }
};

const handleDownload = async (document: Document) => {
    try {
        await downloadDocument(document.id);
    } catch (error) {
        console.error('Error downloading document:', error);
        toast({
            title: "Error",
            description: "Failed to download document",
            variant: "destructive",
        });
    }
};
```

### Step 5: Add Loading State to UI

Update the render section to show loading state:

```typescript
{isLoading ? (
    <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
) : filteredDocuments.length === 0 ? (
    <div className="text-center py-12 text-muted-foreground">
        No documents found
    </div>
) : (
    // ... existing document display code
)}
```

## Testing

After completing all steps:

1. **Test Upload**: Upload a new document and verify it appears in the list
2. **Test Download**: Download a document and verify the file opens
3. **Test Delete**: Delete a document and verify it's removed
4. **Test Filters**: Test category, status, and employee filters
5. **Test Search**: Search for documents by title, description, or tags
6. **Test Approval**: Approve/reject pending documents

## Troubleshooting

### Issue: "Table 'documents' does not exist"
- **Solution**: Run the SQL script in Supabase SQL Editor

### Issue: "Permission denied"
- **Solution**: Check RLS policies in Supabase Dashboard → Authentication → Policies

### Issue: "File upload failed"
- **Solution**: Ensure the 'documents' storage bucket exists in Supabase Storage

### Issue: TypeScript errors about 'documents' table
- **Solution**: Regenerate Supabase types or add manual type definitions

## Next Steps

1. Create the documents table in Supabase
2. Test the upload functionality
3. Replace all mock data references
4. Update handler functions
5. Test thoroughly

## Notes

- The API automatically handles file upload to Supabase Storage
- Files are organized by category: `documents/{category}/{filename}`
- Old files are automatically deleted when documents are removed
- Access count is tracked for analytics
- Notifications are sent to employees when documents are uploaded for them
