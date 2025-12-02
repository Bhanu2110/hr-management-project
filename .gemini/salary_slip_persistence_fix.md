# Salary Slip Database Persistence Fix

## Issue
Salary slips were being generated when adding employees but were not persisting in the database. After refreshing the page, the salary slips would disappear.

## Root Cause
The salary slip insertion was failing silently because the code was trying to insert a field (`medical_insurance`) that doesn't exist in the `salary_slips` table schema in Supabase.

## Fix Applied
Removed the `medical_insurance: 0` field from the salary slip data object in `AddEmployeeForm.tsx` (line 399).

### Before:
```typescript
return {
  // ... other fields
  income_tax,
  medical_insurance: 0,  // ❌ This field doesn't exist in DB
  loan_deduction: 0,
  // ... rest of fields
};
```

### After:
```typescript
return {
  // ... other fields
  income_tax,
  loan_deduction: 0,  // ✅ Removed medical_insurance field
  // ... rest of fields
};
```

## Database Schema
The `salary_slips` table in Supabase has the following structure (relevant fields):
- `basic_salary`
- `hra`
- `transport_allowance`
- `medical_allowance`
- `special_allowance`
- `performance_bonus`
- `other_allowances`
- `pf_employee`
- `professional_tax`
- `income_tax`
- `loan_deduction`
- `advance_deduction`
- `late_deduction`
- `other_deductions`

**Note:** There is NO `medical_insurance` field in the schema.

## Testing
1. Add a new employee with compensation details
2. The salary slip will now be successfully saved to the database
3. Refresh the page - the salary slip should still be visible
4. Check the employee's salary slips section - the slip should appear there as well

## Additional Notes
- The fix ensures that salary slips are properly persisted to the database
- All salary calculations remain the same as per the new rules
- The build completes successfully with no errors
