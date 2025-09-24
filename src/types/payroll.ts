export const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export type PayrollStatus = "pending" | "processed" | "paid" | "failed";

export const PAYROLL_STATUS_COLORS: Record<PayrollStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processed: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export interface PayrollEntry {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  month: number;
  year: number;
  basic_salary: number;
  hra: number;
  transport_allowance: number;
  medical_allowance: number;
  special_allowance: number;
  performance_bonus: number;
  overtime_amount: number;
  other_allowances: number;
  gross_earnings: number;
  pf_employee: number;
  esi_employee: number;
  professional_tax: number;
  income_tax: number;
  loan_deduction: number;
  advance_deduction: number;
  late_deduction: number;
  other_deductions: number;
  total_deductions: number;
  net_salary: number;
  status: PayrollStatus;
  paid_date?: string;
  created_at: string;
}

export interface EmployeePayrollCreateRequest {
  employee_id: string;
  month: number;
  year: number;
  basic_salary: number;
  hra: number;
  transport_allowance: number;
  medical_allowance: number;
  special_allowance: number;
  performance_bonus: number;
  overtime_hours: number;
  overtime_rate: number;
  other_allowances: number;
  pf_employee: number;
  esi_employee: number;
  professional_tax: number;
  income_tax: number;
  loan_deduction: number;
  advance_deduction: number;
  late_deduction: number;
  other_deductions: number;
  paid_date?: string;
}
