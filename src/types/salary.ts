export interface SalaryStructure {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  department: string;
  position: string;

  // Basic Salary Components
  basic_salary: number;
  hra: number;
  transport_allowance: number;
  medical_allowance: number;
  special_allowance: number;
  performance_bonus: number;
  overtime_amount: number;
  other_allowances: number;

  // Deductions
  pf_employee: number;
  pf_employer: number;
  esi_employee: number;
  esi_employer: number;
  professional_tax: number;
  income_tax: number;
  medical_insurance: number;
  loan_deduction: number;
  other_deductions: number;

  // Calculated Fields
  gross_salary: number;
  total_deductions: number;
  net_salary: number;

  // Metadata
  effective_date: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface SalarySlip {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  department: string;
  position: string;
  pan_number?: string;
  joining_date?: string;
  bank_name?: string;
  bank_account_no?: string;
  pf_number?: string;
  uan_number?: string;
  esi_number?: string;

  // Pay Period
  month: number;
  year: number;
  pay_period_start: string;
  pay_period_end: string;
  working_days: number;
  present_days: number;

  // Earnings
  basic_salary: number;
  hra: number;
  transport_allowance: number;
  medical_allowance: number;
  special_allowance: number;
  performance_bonus: number;
  overtime_hours: number;
  overtime_rate: number;
  overtime_amount: number;
  other_allowances: number;
  gross_earnings: number;

  // Deductions
  pf_employee: number;
  esi_employee: number;
  professional_tax: number;
  income_tax: number;
  medical_insurance: number;
  loan_deduction: number;
  advance_deduction: number;
  late_deduction: number;
  other_deductions: number;
  total_deductions: number;

  // Net Pay
  net_salary: number;

  // Company Contributions (for reference)
  pf_employer: number;
  esi_employer: number;

  // Status and Metadata
  status: 'draft' | 'processed' | 'paid' | 'cancelled';
  generated_date: string;
  paid_date?: string;
  created_at: string;
  updated_at: string;
}

export interface SalarySummary {
  total_employees: number;
  total_gross_salary: number;
  total_deductions: number;
  total_net_salary: number;
  average_salary: number;
  highest_salary: number;
  lowest_salary: number;
}

export interface SalaryFilter {
  month?: number;
  year?: number;
  department?: string;
  employee_id?: string;
  status?: SalarySlip['status'];
}

export interface SalaryCreateRequest {
  employee_id: string;
  month: number;
  year: number;
  working_days: number;
  present_days: number;
  basic_salary?: number;
  hra?: number;
  transport_allowance?: number;
  medical_allowance?: number;
  special_allowance?: number;
  performance_bonus?: number;
  overtime_hours?: number;
  overtime_rate?: number;
  other_allowances?: number;
  pf_employee?: number;
  esi_employee?: number;
  professional_tax?: number;
  income_tax?: number;
  medical_insurance?: number;
  loan_deduction?: number;
  advance_deduction?: number;
  late_deduction?: number;
  other_deductions?: number;
  paid_date?: string;
}

export interface SalaryUpdateRequest {
  basic_salary?: number;
  hra?: number;
  transport_allowance?: number;
  medical_allowance?: number;
  special_allowance?: number;
  performance_bonus?: number;
  other_allowances?: number;
  pf_employee?: number;
  esi_employee?: number;
  professional_tax?: number;
  income_tax?: number;
  loan_deduction?: number;
  other_deductions?: number;
  effective_date?: string;
}

export const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export const SALARY_STATUS_COLORS = {
  draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processed: 'bg-blue-100 text-blue-800 border-blue-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};