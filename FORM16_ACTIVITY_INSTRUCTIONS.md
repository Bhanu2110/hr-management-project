# Form 16 Activity for Employee Dashboard

## Code to Add

Add this code snippet after the leave request activity fetch (around line 133) and before the sort/setRecentActivities:

```typescript
      // Fetch latest Form 16 upload activity
      console.log("Fetching latest Form 16 upload for employee:", employee?.id);
      const { data: form16Data, error: form16Error } = await supabase
        .from("form16_documents")
        .select("id, file_name, financial_year, quarter, uploaded_at, created_at")
        .eq("employee_id", employee.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (form16Error) {
        console.error("Error fetching Form 16 data:", form16Error);
      }
      console.log("Form 16 data:", form16Data);

      if (form16Data && form16Data.length > 0) {
        const form16 = form16Data[0];
        const uploadedAt = new Date(form16.uploaded_at || form16.created_at);
        const quarterText = form16.quarter ? ` (${form16.quarter})` : "";

        activities.push({
          id: `form16_${form16.id}`,
          title: "New Form 16 uploaded",
          description: `Form 16 for ${form16.financial_year}${quarterText} is now available for download`,
          icon: "file",
          timestamp: uploadedAt.toISOString(),
        });
      }
```

## Where to Add It

In `src/pages/EmployeeDashboard.tsx`, find this section (around line 133):

```typescript
        });
      }

      // Sort by newest first and keep a few entries
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
```

Add the Form 16 code between the `}` after leave request and before the `// Sort by newest` comment.

## Result

After adding this code, the Recent Activity section will show:
- Check-in activities (with clock icon, blue)
- Leave request approvals/rejections (with check/reject icon, green/red)
- **Form 16 uploads (with file icon, purple)** ← NEW!

The activities will be sorted by timestamp, showing the most recent 3 activities.
