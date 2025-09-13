export type ReportType = 
  | 'attendance'
  | 'payroll'
  | 'leave'
  | 'performance'
  | 'employee'
  | 'department'
  | 'compliance'
  | 'custom';

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export type ReportStatus = 'draft' | 'generating' | 'completed' | 'failed' | 'scheduled';

export type ReportFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  
  // Report parameters
  parameters: ReportParameters;
  
  // Scheduling
  frequency?: ReportFrequency;
  scheduled_date?: string;
  next_run_date?: string;
  
  // Access control
  visibility: 'public' | 'private' | 'department' | 'role_based';
  accessible_roles: ('admin' | 'hr' | 'manager' | 'employee')[];
  accessible_departments: string[];
  accessible_employees: string[];
  
  // File information
  file_url?: string;
  file_size?: number;
  
  // Metadata
  generated_by: string;
  generated_by_name: string;
  generated_date?: string;
  expires_at?: string;
  
  // Statistics
  download_count: number;
  last_downloaded?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ReportParameters {
  // Date range
  date_range: {
    start_date: string;
    end_date: string;
  };
  
  // Filters
  employee_ids?: string[];
  department_ids?: string[];
  position_ids?: string[];
  
  // Report-specific parameters
  attendance_params?: AttendanceReportParams;
  payroll_params?: PayrollReportParams;
  leave_params?: LeaveReportParams;
  performance_params?: PerformanceReportParams;
  employee_params?: EmployeeReportParams;
  department_params?: DepartmentReportParams;
  compliance_params?: ComplianceReportParams;
  custom_params?: CustomReportParams;
}

export interface AttendanceReportParams {
  include_overtime: boolean;
  include_breaks: boolean;
  group_by: 'employee' | 'department' | 'date';
  show_summary: boolean;
  include_late_arrivals: boolean;
  include_early_departures: boolean;
}

export interface PayrollReportParams {
  include_deductions: boolean;
  include_benefits: boolean;
  include_tax_details: boolean;
  group_by: 'employee' | 'department' | 'month';
  show_year_to_date: boolean;
  currency_format: 'INR' | 'USD' | 'EUR';
}

export interface LeaveReportParams {
  leave_types: string[];
  include_pending: boolean;
  include_approved: boolean;
  include_rejected: boolean;
  group_by: 'employee' | 'department' | 'leave_type';
  show_balance: boolean;
}

export interface PerformanceReportParams {
  review_periods: string[];
  include_goals: boolean;
  include_ratings: boolean;
  include_feedback: boolean;
  group_by: 'employee' | 'department' | 'manager';
}

export interface EmployeeReportParams {
  include_personal_info: boolean;
  include_employment_history: boolean;
  include_salary_info: boolean;
  include_performance_data: boolean;
  include_documents: boolean;
  active_only: boolean;
}

export interface DepartmentReportParams {
  include_headcount: boolean;
  include_budget: boolean;
  include_performance_metrics: boolean;
  include_turnover_rate: boolean;
  compare_periods: boolean;
}

export interface ComplianceReportParams {
  compliance_types: string[];
  include_violations: boolean;
  include_training_status: boolean;
  include_certifications: boolean;
  risk_level: 'all' | 'high' | 'medium' | 'low';
}

export interface CustomReportParams {
  fields: string[];
  calculations: ReportCalculation[];
  grouping: string[];
  sorting: ReportSorting[];
  filters: ReportFilter[];
}

export interface ReportCalculation {
  field: string;
  operation: 'sum' | 'average' | 'count' | 'min' | 'max';
  alias?: string;
}

export interface ReportSorting {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: any;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  parameters: Partial<ReportParameters>;
  is_system: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportSchedule {
  id: string;
  report_id: string;
  name: string;
  frequency: ReportFrequency;
  schedule_time: string; // HH:mm format
  schedule_days?: number[]; // 0-6 for weekly, 1-31 for monthly
  recipients: string[];
  is_active: boolean;
  last_run?: string;
  next_run: string;
  created_at: string;
  updated_at: string;
}

export interface ReportGenerationRequest {
  title: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  parameters: ReportParameters;
  visibility: Report['visibility'];
  accessible_roles: Report['accessible_roles'];
  accessible_departments?: string[];
  accessible_employees?: string[];
  expires_at?: string;
  schedule?: {
    frequency: ReportFrequency;
    schedule_time: string;
    recipients: string[];
  };
}

export interface ReportStats {
  total_reports: number;
  reports_by_type: Record<ReportType, number>;
  reports_by_status: Record<ReportStatus, number>;
  recent_reports: number;
  scheduled_reports: number;
  total_downloads: number;
  storage_used: number; // in bytes
}

export const REPORT_TYPES: Record<ReportType, {
  name: string;
  description: string;
  icon: string;
  category: 'hr' | 'finance' | 'operations' | 'custom';
  admin_only: boolean;
}> = {
  attendance: {
    name: 'Attendance Report',
    description: 'Employee attendance, overtime, and time tracking data',
    icon: 'Clock',
    category: 'hr',
    admin_only: false,
  },
  payroll: {
    name: 'Payroll Report',
    description: 'Salary, deductions, benefits, and tax information',
    icon: 'DollarSign',
    category: 'finance',
    admin_only: true,
  },
  leave: {
    name: 'Leave Report',
    description: 'Leave applications, balances, and usage patterns',
    icon: 'Calendar',
    category: 'hr',
    admin_only: false,
  },
  performance: {
    name: 'Performance Report',
    description: 'Employee performance reviews, goals, and ratings',
    icon: 'TrendingUp',
    category: 'hr',
    admin_only: true,
  },
  employee: {
    name: 'Employee Report',
    description: 'Employee profiles, demographics, and employment data',
    icon: 'Users',
    category: 'hr',
    admin_only: true,
  },
  department: {
    name: 'Department Report',
    description: 'Department metrics, headcount, and performance data',
    icon: 'Building',
    category: 'operations',
    admin_only: true,
  },
  compliance: {
    name: 'Compliance Report',
    description: 'Regulatory compliance, training, and certification status',
    icon: 'Shield',
    category: 'operations',
    admin_only: true,
  },
  custom: {
    name: 'Custom Report',
    description: 'Build custom reports with specific fields and calculations',
    icon: 'Settings',
    category: 'custom',
    admin_only: false,
  },
};

export const REPORT_STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  generating: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  scheduled: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export const REPORT_FORMAT_OPTIONS = [
  { value: 'pdf', label: 'PDF', description: 'Portable Document Format' },
  { value: 'excel', label: 'Excel', description: 'Microsoft Excel Spreadsheet' },
  { value: 'csv', label: 'CSV', description: 'Comma Separated Values' },
  { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
];

export const FREQUENCY_OPTIONS = [
  { value: 'once', label: 'One Time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public', description: 'Visible to all employees' },
  { value: 'private', label: 'Private', description: 'Visible only to specific users' },
  { value: 'department', label: 'Department', description: 'Visible to specific departments' },
  { value: 'role_based', label: 'Role Based', description: 'Visible based on user roles' },
];

/**
 * Utility function to get report type icon
 */
export function getReportTypeIcon(type: ReportType): string {
  return REPORT_TYPES[type]?.icon || 'FileText';
}

/**
 * Utility function to format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Utility function to format report date range
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const end = new Date(endDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return `${start} - ${end}`;
}

/**
 * Utility function to check if user can access report
 */
export function canAccessReport(
  report: Report,
  userRole: 'admin' | 'hr' | 'manager' | 'employee',
  userDepartment?: string,
  userId?: string
): boolean {
  // Admin and HR can access all reports
  if (userRole === 'admin' || userRole === 'hr') {
    return true;
  }

  // Check visibility rules
  switch (report.visibility) {
    case 'public':
      return true;
    
    case 'private':
      return report.accessible_employees.includes(userId || '');
    
    case 'department':
      return report.accessible_departments.includes(userDepartment || '');
    
    case 'role_based':
      return report.accessible_roles.includes(userRole);
    
    default:
      return false;
  }
}
