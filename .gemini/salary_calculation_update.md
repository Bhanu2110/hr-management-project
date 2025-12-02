# Salary Slip Calculation Update

## Summary
Updated the automatic salary slip generation logic to use the new calculation rules when adding employees.

## Changes Made

### 1. Updated Calculation Logic in `AddEmployeeForm.tsx`

**Previous Calculation:**
- Basic = 40% of CTC
- HRA = 20% of CTC
- Special Allowance = 15% of CTC
- Transport = ₹2,000
- Medical = ₹1,500
- Employee PF = 12% of Basic
- Professional Tax = ₹200
- Income Tax = 10% of CTC

**New Calculation (as per requirements):**

1. **Employer PF**: ₹1,800 per month (₹21,600 yearly)
2. **Gross Salary (Yearly)**: CTC - ₹21,600
3. **Gross Salary (Monthly)**: Gross (Yearly) / 12
4. **Basic**: 50% of Gross Monthly
5. **HRA**: 40% of Basic
6. **Project Allowance**: Gross - (Basic + HRA)
7. **Other Allowances**: All set to 0
   - Conveyance = 0
   - Medical Allowance = 0
   - Meal Allowance = 0
   - LTA = 0
   - Bonus = 0
8. **Employee PF**: ₹1,800 (fixed)
9. **Professional Tax**: ₹150 (fixed)
10. **Income Tax**: 0 (shown as "As applicable")

### 2. Updated Salary Slip View in `SalarySlipView.tsx`

**Earnings Section:**
- Removed CTC from earnings list (moved to footer)
- Renamed "SPECIAL ALLOWANCE" to "PROJECT ALLOWANCE"
- Added "MEAL ALLOWANCE" (showing 0)
- Changed "STATUTORY BONUS" to "BONUS"
- Removed "VARIABLE PAY" and "INCENTIVES"
- Added "TOTAL EARNINGS" summary within the earnings section

**Deductions Section:**
- Changed "PROF TAX" to "PROFESSIONAL TAX"
- Changed "PROVIDENT FUND" to "EMPLOYEE PF"
- Income Tax now shows "As applicable" when value is 0
- Added "TOTAL DEDUCTIONS" summary within the deductions section

**Footer Section:**
- Simplified Net Salary display
- Added CTC (Yearly) calculation
- Added Employer PF (Monthly) display
- Added Employer PF (Yearly) display
- Updated footer text to "This is a system-generated salary slip."

## Example Calculation

For an employee with CTC of ₹600,000 per year:

1. Employer PF (Yearly) = ₹21,600
2. Gross Salary (Yearly) = ₹600,000 - ₹21,600 = ₹578,400
3. Gross Salary (Monthly) = ₹578,400 / 12 = ₹48,200
4. Basic = 50% of ₹48,200 = ₹24,100
5. HRA = 40% of ₹24,100 = ₹9,640
6. Project Allowance = ₹48,200 - (₹24,100 + ₹9,640) = ₹14,460
7. Total Earnings = ₹48,200
8. Employee PF = ₹1,800
9. Professional Tax = ₹150
10. Income Tax = ₹0
11. Total Deductions = ₹1,950
12. Net Salary = ₹48,200 - ₹1,950 = ₹46,250

## Testing

To test the changes:
1. Add a new employee with compensation details
2. The salary slip will be automatically generated using the new calculation rules
3. View the salary slip to verify the calculations match the requirements
4. Download the PDF to ensure the format is correct

## Notes

- The changes only affect newly generated salary slips
- Existing salary slips in the database will retain their original calculations
- The calculation is based on the CTC entered in the compensation records
- All monetary values are rounded to the nearest rupee
