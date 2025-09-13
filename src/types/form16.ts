export interface Form16Data {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  pan_number: string;
  assessment_year: string;
  financial_year: string;
  employer_name: string;
  employer_address: string;
  employer_tan: string;
  
  // Salary Details
  basic_salary: number;
  hra: number;
  special_allowance: number;
  other_allowances: number;
  gross_salary: number;
  
  // Deductions
  pf_employee: number;
  pf_employer: number;
  esi_employee: number;
  esi_employer: number;
  professional_tax: number;
  other_deductions: number;
  total_deductions: number;
  
  // Tax Details
  taxable_income: number;
  income_tax: number;
  education_cess: number;
  total_tax: number;
  tds_deducted: number;
  
  // Additional Information
  previous_employer_details?: string;
  exemptions_claimed: number;
  standard_deduction: number;
  
  // Status and Metadata
  status: 'draft' | 'generated' | 'issued';
  generated_date?: string;
  issued_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Form16Summary {
  total_gross_salary: number;
  total_deductions: number;
  total_taxable_income: number;
  total_tax_deducted: number;
  net_salary: number;
}

export interface Form16Filter {
  assessment_year?: string;
  financial_year?: string;
  employee_id?: string;
  status?: Form16Data['status'];
}

export interface Form16CreateRequest {
  employee_id: string;
  assessment_year: string;
  financial_year: string;
  salary_details: {
    basic_salary: number;
    hra: number;
    special_allowance: number;
    other_allowances: number;
  };
  deductions: {
    pf_employee: number;
    pf_employer: number;
    esi_employee: number;
    esi_employer: number;
    professional_tax: number;
    other_deductions: number;
  };
  tax_details: {
    exemptions_claimed: number;
    standard_deduction: number;
    previous_employer_details?: string;
  };
}
