# PAN Number Field Implementation

## Overview
Added a "PAN Number" input field to both the Add Employee and Edit Employee forms, positioned before the Compensation Details section. This field maps to the existing `pan_number` column in the `employees` table.

## Changes Made

### 1. AddEmployeeForm.tsx
- **Schema Update**: Added `pan_number` (optional string) to the Zod validation schema.
- **Default Values**: Initialized `pan_number` as an empty string.
- **UI**: Added a text input field for PAN Number before the Compensation Details section.
  - Features: Uppercase text, max length 10.
- **Submission**: Included `pan_number` in the data payload sent to Supabase.

### 2. EditEmployeeForm.tsx
- **Schema Update**: Added `pan_number` (optional string) to the Zod validation schema.
- **Default Values**: Populated `pan_number` from the existing employee data.
- **UI**: Added the same text input field for PAN Number before the Compensation Details section.
- **Submission**: Included `pan_number` in the update payload sent to Supabase.

## Verification
- **Add Employee**: You should see the PAN Number field. Entering a value and saving should persist it to the database.
- **Edit Employee**: You should see the PAN Number field populated with the existing value (if any). Modifying it and saving should update the database.
