# Form 16 Integration Setup Guide

## Overview
This guide will help you integrate Form 16 generation and management with your Supabase database.

## Step 1: Run the SQL Migration

1. Open your Supabase Dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/create_form16_table.sql`
4. Run the SQL query to create the `form16_records` table

## Step 2: Update Supabase Types

After creating the table, you need to regenerate the TypeScript types:

```bash
# If you have Supabase CLI installed
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

Or manually add the form16_records type to `src/integrations/supabase/types.ts`:

```typescript
form16_records: {
  Row: {
    id: string;
    employee_id: string;
    employee_name: string;
    employee_email: string;
    pan_number: string | null;
    assessment_year: string;
    financial_year: string;
    employer_name: string;
    employer_address: string;
    employer_tan: string;
    basic_salary: number;
    hra: number;
    special_allowance: number;
    other_allowances: number;
    gross_salary: number;
    pf_employee: number;
    pf_employer: number;
    esi_employee: number;
    esi_employer: number;
    professional_tax: number;
    other_deductions: number;
    total_deductions: number;
    taxable_income: number;
    income_tax: number;
    education_cess: number;
    total_tax: number;
    tds_deducted: number;
    exemptions_claimed: number;
    standard_deduction: number;
    previous_employer_details: string | null;
    status: 'draft' | 'generated' | 'issued';
    generated_date: string | null;
    issued_date: string | null;
    pdf_url: string | null;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
  };
  Insert: {
    // ... similar structure for inserts
  };
  Update: {
    // ... similar structure for updates
  };
}
```

## Step 3: How It Works

### Admin Side (Form16Management Component)
1. Admin clicks "Generate Form 16" button
2. Selects an employee from the dropdown
3. Enters salary details, deductions, and tax information
4. Clicks "Generate Form 16"
5. The system:
   - Fetches employee details from the database
   - Calculates taxable income and tax automatically
   - Creates a new record in `form16_records` table with status 'generated'
   - Shows success message

6. Admin can then "Issue" the Form 16:
   - Click the Send icon next to a 'generated' Form 16
   - Status changes to 'issued'
   - Form 16 becomes visible to the employee

### Employee Side (Form16Download Component)
1. Employee navigates to their Form 16 section
2. System fetches all Form 16 records where:
   - `employee_id` matches their ID
   - `status` is 'issued'
3. Employee can view and download their issued Form 16 certificates

## Step 4: Update Form16Download Component

The Form16Download component needs to be updated to fetch from the database.
This will be done in the next step.

## Features Implemented

✅ Database table with RLS policies
✅ Admin can generate Form 16 for any employee
✅ Automatic tax calculation
✅ Status workflow: draft → generated → issued
✅ Only issued Form 16s are visible to employees
✅ Real-time statistics dashboard
✅ Search and filter functionality

## Next Steps

1. Run the SQL migration
2. Update Supabase types
3. Update Form16Download component for employees
4. Implement PDF generation (optional)
