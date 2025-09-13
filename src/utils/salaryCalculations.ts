import { SalarySlip, SalaryStructure } from "@/types/salary";

export interface SalaryCalculationInput {
  basicSalary: number;
  hra: number;
  transportAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  performanceBonus?: number;
  overtimeHours?: number;
  overtimeRate?: number;
  otherAllowances?: number;
  
  // Attendance
  workingDays: number;
  presentDays: number;
  
  // Deductions
  pfRate?: number; // Default 12%
  esiRate?: number; // Default 0.75% for employee
  professionalTax?: number;
  incomeTaxRate?: number;
  loanDeduction?: number;
  advanceDeduction?: number;
  otherDeductions?: number;
}

export interface CalculatedSalary {
  grossEarnings: number;
  totalDeductions: number;
  netSalary: number;
  pfEmployee: number;
  pfEmployer: number;
  esiEmployee: number;
  esiEmployer: number;
  incomeTax: number;
  attendanceDeduction: number;
  overtimeAmount: number;
}

/**
 * Calculate salary based on input parameters
 */
export function calculateSalary(input: SalaryCalculationInput): CalculatedSalary {
  const {
    basicSalary,
    hra,
    transportAllowance,
    medicalAllowance,
    specialAllowance,
    performanceBonus = 0,
    overtimeHours = 0,
    overtimeRate = 0,
    otherAllowances = 0,
    workingDays,
    presentDays,
    pfRate = 0.12, // 12%
    esiRate = 0.0075, // 0.75%
    professionalTax = 200,
    incomeTaxRate = 0.1, // 10%
    loanDeduction = 0,
    advanceDeduction = 0,
    otherDeductions = 0,
  } = input;

  // Calculate attendance ratio
  const attendanceRatio = presentDays / workingDays;
  
  // Calculate pro-rated salary based on attendance
  const proRatedBasic = basicSalary * attendanceRatio;
  const proRatedHra = hra * attendanceRatio;
  const proRatedTransport = transportAllowance * attendanceRatio;
  const proRatedMedical = medicalAllowance * attendanceRatio;
  const proRatedSpecial = specialAllowance * attendanceRatio;
  
  // Calculate overtime
  const overtimeAmount = overtimeHours * overtimeRate;
  
  // Calculate gross earnings
  const grossEarnings = 
    proRatedBasic + 
    proRatedHra + 
    proRatedTransport + 
    proRatedMedical + 
    proRatedSpecial + 
    performanceBonus + 
    overtimeAmount + 
    otherAllowances;

  // Calculate PF (on basic salary only, capped at ₹15,000)
  const pfBaseSalary = Math.min(proRatedBasic, 15000);
  const pfEmployee = Math.round(pfBaseSalary * pfRate);
  const pfEmployer = pfEmployee; // Employer contribution same as employee

  // Calculate ESI (on gross salary if less than ₹21,000)
  const esiEmployee = grossEarnings <= 21000 ? Math.round(grossEarnings * esiRate) : 0;
  const esiEmployer = esiEmployee > 0 ? Math.round(grossEarnings * 0.0325) : 0; // 3.25% employer rate

  // Calculate income tax (simplified calculation)
  const taxableIncome = Math.max(0, grossEarnings - pfEmployee - esiEmployee - 50000); // ₹50k standard deduction
  const incomeTax = Math.round(taxableIncome * incomeTaxRate);

  // Calculate attendance deduction (for absent days)
  const attendanceDeduction = (basicSalary + hra) * (1 - attendanceRatio);

  // Calculate total deductions
  const totalDeductions = 
    pfEmployee + 
    esiEmployee + 
    professionalTax + 
    incomeTax + 
    loanDeduction + 
    advanceDeduction + 
    otherDeductions;

  // Calculate net salary
  const netSalary = Math.round(grossEarnings - totalDeductions);

  return {
    grossEarnings: Math.round(grossEarnings),
    totalDeductions: Math.round(totalDeductions),
    netSalary,
    pfEmployee,
    pfEmployer,
    esiEmployee,
    esiEmployer,
    incomeTax,
    attendanceDeduction: Math.round(attendanceDeduction),
    overtimeAmount: Math.round(overtimeAmount),
  };
}

/**
 * Generate salary slip from salary structure and additional inputs
 */
export function generateSalarySlip(
  structure: SalaryStructure,
  month: number,
  year: number,
  additionalInputs: Partial<SalaryCalculationInput> = {}
): Partial<SalarySlip> {
  const input: SalaryCalculationInput = {
    basicSalary: structure.basic_salary,
    hra: structure.hra,
    transportAllowance: structure.transport_allowance,
    medicalAllowance: structure.medical_allowance,
    specialAllowance: structure.special_allowance,
    performanceBonus: additionalInputs.performanceBonus || 0,
    overtimeHours: additionalInputs.overtimeHours || 0,
    overtimeRate: additionalInputs.overtimeRate || 500,
    otherAllowances: additionalInputs.otherAllowances || 0,
    workingDays: additionalInputs.workingDays || 22,
    presentDays: additionalInputs.presentDays || 22,
    loanDeduction: additionalInputs.loanDeduction || 0,
    advanceDeduction: additionalInputs.advanceDeduction || 0,
    otherDeductions: additionalInputs.otherDeductions || 0,
    ...additionalInputs,
  };

  const calculated = calculateSalary(input);
  
  // Get pay period dates
  const payPeriodStart = new Date(year, month - 1, 1);
  const payPeriodEnd = new Date(year, month, 0);

  return {
    employee_id: structure.employee_id,
    employee_name: structure.employee_name,
    employee_email: structure.employee_email,
    department: structure.department,
    position: structure.position,
    month,
    year,
    pay_period_start: payPeriodStart.toISOString(),
    pay_period_end: payPeriodEnd.toISOString(),
    working_days: input.workingDays,
    present_days: input.presentDays,
    basic_salary: input.basicSalary,
    hra: input.hra,
    transport_allowance: input.transportAllowance,
    medical_allowance: input.medicalAllowance,
    special_allowance: input.specialAllowance,
    performance_bonus: input.performanceBonus || 0,
    overtime_hours: input.overtimeHours || 0,
    overtime_rate: input.overtimeRate || 0,
    overtime_amount: calculated.overtimeAmount,
    other_allowances: input.otherAllowances || 0,
    gross_earnings: calculated.grossEarnings,
    pf_employee: calculated.pfEmployee,
    esi_employee: calculated.esiEmployee,
    professional_tax: input.professionalTax || 200,
    income_tax: calculated.incomeTax,
    loan_deduction: input.loanDeduction || 0,
    advance_deduction: input.advanceDeduction || 0,
    late_deduction: calculated.attendanceDeduction,
    other_deductions: input.otherDeductions || 0,
    total_deductions: calculated.totalDeductions,
    net_salary: calculated.netSalary,
    pf_employer: calculated.pfEmployer,
    esi_employer: calculated.esiEmployer,
    status: 'draft' as const,
    generated_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Calculate annual salary breakdown
 */
export function calculateAnnualSalary(structure: SalaryStructure): {
  annualGross: number;
  annualNet: number;
  annualDeductions: number;
  monthlyAverage: number;
} {
  const monthlyGross = structure.gross_salary;
  const monthlyNet = structure.net_salary;
  const monthlyDeductions = structure.total_deductions;

  return {
    annualGross: monthlyGross * 12,
    annualNet: monthlyNet * 12,
    annualDeductions: monthlyDeductions * 12,
    monthlyAverage: monthlyNet,
  };
}

/**
 * Calculate salary increment
 */
export function calculateIncrement(
  currentSalary: number,
  incrementPercentage: number
): {
  newSalary: number;
  incrementAmount: number;
} {
  const incrementAmount = Math.round(currentSalary * (incrementPercentage / 100));
  const newSalary = currentSalary + incrementAmount;

  return {
    newSalary,
    incrementAmount,
  };
}

/**
 * Calculate CTC (Cost to Company)
 */
export function calculateCTC(structure: SalaryStructure): {
  ctc: number;
  employeeComponents: number;
  employerComponents: number;
  breakdown: {
    grossSalary: number;
    pfEmployer: number;
    esiEmployer: number;
    gratuity: number;
    bonus: number;
    other: number;
  };
} {
  const grossSalary = structure.gross_salary;
  const pfEmployer = structure.pf_employer;
  const esiEmployer = structure.esi_employer;
  
  // Calculate additional employer costs
  const gratuity = Math.round(grossSalary * 0.0481); // 4.81% of gross salary
  const bonus = Math.round(grossSalary * 0.0833); // 8.33% of gross salary (annual bonus)
  const other = Math.round(grossSalary * 0.02); // 2% for other benefits

  const employeeComponents = grossSalary;
  const employerComponents = pfEmployer + esiEmployer + gratuity + bonus + other;
  const ctc = employeeComponents + employerComponents;

  return {
    ctc,
    employeeComponents,
    employerComponents,
    breakdown: {
      grossSalary,
      pfEmployer,
      esiEmployer,
      gratuity,
      bonus,
      other,
    },
  };
}

/**
 * Validate salary calculation inputs
 */
export function validateSalaryInput(input: Partial<SalaryCalculationInput>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input.basicSalary || input.basicSalary <= 0) {
    errors.push("Basic salary must be greater than 0");
  }

  if (!input.workingDays || input.workingDays <= 0 || input.workingDays > 31) {
    errors.push("Working days must be between 1 and 31");
  }

  if (!input.presentDays || input.presentDays < 0 || (input.workingDays && input.presentDays > input.workingDays)) {
    errors.push("Present days must be between 0 and working days");
  }

  if (input.overtimeHours && input.overtimeHours < 0) {
    errors.push("Overtime hours cannot be negative");
  }

  if (input.overtimeRate && input.overtimeRate < 0) {
    errors.push("Overtime rate cannot be negative");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate tax savings
 */
export function calculateTaxSavings(
  grossSalary: number,
  investments: {
    pf: number;
    esi: number;
    section80C: number;
    section80D: number;
    hra: number;
  }
): {
  taxableIncome: number;
  taxSavings: number;
  effectiveTaxRate: number;
} {
  const standardDeduction = 50000;
  const totalDeductions = 
    investments.pf + 
    investments.esi + 
    Math.min(investments.section80C, 150000) + 
    Math.min(investments.section80D, 25000) + 
    investments.hra + 
    standardDeduction;

  const taxableIncome = Math.max(0, grossSalary - totalDeductions);
  
  // Simplified tax calculation (old regime)
  let tax = 0;
  if (taxableIncome > 250000) {
    if (taxableIncome <= 500000) {
      tax = (taxableIncome - 250000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      tax = 12500 + (taxableIncome - 500000) * 0.2;
    } else {
      tax = 112500 + (taxableIncome - 1000000) * 0.3;
    }
  }

  // Add cess
  tax = tax * 1.04;

  const taxWithoutDeductions = Math.max(0, (grossSalary - standardDeduction - investments.pf - investments.esi) * 0.2);
  const taxSavings = Math.max(0, taxWithoutDeductions - tax);
  const effectiveTaxRate = grossSalary > 0 ? (tax / grossSalary) * 100 : 0;

  return {
    taxableIncome: Math.round(taxableIncome),
    taxSavings: Math.round(taxSavings),
    effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100,
  };
}
