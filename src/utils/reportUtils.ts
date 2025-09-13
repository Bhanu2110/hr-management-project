import { 
  Report, 
  ReportType,
  ReportFormat,
  ReportParameters,
  ReportGenerationRequest,
  AttendanceReportParams,
  PayrollReportParams,
  LeaveReportParams,
  PerformanceReportParams,
  EmployeeReportParams,
  DepartmentReportParams,
  ComplianceReportParams,
  CustomReportParams,
  REPORT_TYPES,
  formatFileSize,
  formatDateRange
} from "@/types/reports";

/**
 * Validates report generation request data
 */
export function validateReportRequest(request: Partial<ReportGenerationRequest>): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];

  // Required fields validation
  if (!request.title?.trim()) {
    errors.push("Report title is required");
  }

  if (!request.type) {
    errors.push("Report type is required");
  }

  if (!request.format) {
    errors.push("Report format is required");
  }

  if (!request.parameters?.date_range?.start_date) {
    errors.push("Start date is required");
  }

  if (!request.parameters?.date_range?.end_date) {
    errors.push("End date is required");
  }

  // Date range validation
  if (request.parameters?.date_range?.start_date && request.parameters?.date_range?.end_date) {
    const startDate = new Date(request.parameters.date_range.start_date);
    const endDate = new Date(request.parameters.date_range.end_date);
    
    if (startDate > endDate) {
      errors.push("Start date must be before end date");
    }

    if (endDate > new Date()) {
      errors.push("End date cannot be in the future");
    }

    // Check for reasonable date range (not more than 5 years)
    const maxRange = 5 * 365 * 24 * 60 * 60 * 1000; // 5 years in milliseconds
    if (endDate.getTime() - startDate.getTime() > maxRange) {
      errors.push("Date range cannot exceed 5 years");
    }
  }

  // Title length validation
  if (request.title && request.title.length > 200) {
    errors.push("Report title must be less than 200 characters");
  }

  // Description length validation
  if (request.description && request.description.length > 1000) {
    errors.push("Report description must be less than 1000 characters");
  }

  // Access control validation
  if (request.visibility === 'private' && 
      (!request.accessible_employees || request.accessible_employees.length === 0) &&
      (!request.accessible_roles || request.accessible_roles.length === 0)) {
    errors.push("Private reports must have at least one accessible role or employee specified");
  }

  if (request.visibility === 'department' && 
      (!request.accessible_departments || request.accessible_departments.length === 0)) {
    errors.push("Department-restricted reports must have at least one department specified");
  }

  if (request.visibility === 'role_based' && 
      (!request.accessible_roles || request.accessible_roles.length === 0)) {
    errors.push("Role-based reports must have at least one role specified");
  }

  // Schedule validation
  if (request.schedule) {
    if (request.schedule.frequency !== 'once' && !request.schedule.schedule_time) {
      errors.push("Schedule time is required for recurring reports");
    }

    if (request.schedule.recipients && request.schedule.recipients.length === 0) {
      errors.push("At least one recipient is required for scheduled reports");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generates default parameters for a report type
 */
export function getDefaultReportParameters(type: ReportType): Partial<ReportParameters> {
  const defaultDateRange = {
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    end_date: new Date().toISOString()
  };

  const baseParams: Partial<ReportParameters> = {
    date_range: defaultDateRange
  };

  switch (type) {
    case 'attendance':
      return {
        ...baseParams,
        attendance_params: {
          include_overtime: true,
          include_breaks: false,
          group_by: 'employee',
          show_summary: true,
          include_late_arrivals: true,
          include_early_departures: true
        }
      };

    case 'payroll':
      return {
        ...baseParams,
        payroll_params: {
          include_deductions: true,
          include_benefits: true,
          include_tax_details: true,
          group_by: 'employee',
          show_year_to_date: false,
          currency_format: 'INR'
        }
      };

    case 'leave':
      return {
        ...baseParams,
        leave_params: {
          leave_types: ['annual', 'sick', 'casual'],
          include_pending: true,
          include_approved: true,
          include_rejected: false,
          group_by: 'employee',
          show_balance: true
        }
      };

    case 'performance':
      return {
        ...baseParams,
        performance_params: {
          review_periods: [],
          include_goals: true,
          include_ratings: true,
          include_feedback: false,
          group_by: 'employee'
        }
      };

    case 'employee':
      return {
        ...baseParams,
        employee_params: {
          include_personal_info: true,
          include_employment_history: true,
          include_salary_info: false,
          include_performance_data: false,
          include_documents: false,
          active_only: true
        }
      };

    case 'department':
      return {
        ...baseParams,
        department_params: {
          include_headcount: true,
          include_budget: false,
          include_performance_metrics: true,
          include_turnover_rate: true,
          compare_periods: false
        }
      };

    case 'compliance':
      return {
        ...baseParams,
        compliance_params: {
          compliance_types: ['training', 'certification'],
          include_violations: false,
          include_training_status: true,
          include_certifications: true,
          risk_level: 'all'
        }
      };

    case 'custom':
      return {
        ...baseParams,
        custom_params: {
          fields: [],
          calculations: [],
          grouping: [],
          sorting: [],
          filters: []
        }
      };

    default:
      return baseParams;
  }
}

/**
 * Generates a unique report file name
 */
export function generateReportFileName(
  type: ReportType,
  format: ReportFormat,
  dateRange: { start_date: string; end_date: string },
  title?: string
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const startDate = new Date(dateRange.start_date).toISOString().split('T')[0];
  const endDate = new Date(dateRange.end_date).toISOString().split('T')[0];
  
  // Sanitize title if provided
  let sanitizedTitle = '';
  if (title) {
    sanitizedTitle = title
      .replace(/[^a-zA-Z0-9\-_\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase()
      .substring(0, 50); // Limit length
  }

  const baseName = sanitizedTitle || `${type}_report`;
  const dateRangePart = startDate === endDate ? startDate : `${startDate}_to_${endDate}`;
  
  return `${baseName}_${dateRangePart}_${timestamp}.${format}`;
}

/**
 * Calculates estimated file size based on report parameters
 */
export function estimateReportSize(
  type: ReportType,
  format: ReportFormat,
  parameters: ReportParameters,
  estimatedRecords: number = 1000
): number {
  // Base size estimates per format (in bytes)
  const formatMultipliers = {
    pdf: 2048,      // ~2KB per record
    excel: 1024,    // ~1KB per record
    csv: 512,       // ~0.5KB per record
    json: 768       // ~0.75KB per record
  };

  // Type-specific multipliers
  const typeMultipliers = {
    attendance: 1.2,
    payroll: 2.0,     // Larger due to financial data
    leave: 0.8,
    performance: 1.5,
    employee: 1.8,
    department: 0.6,
    compliance: 1.3,
    custom: 1.0
  };

  const baseSize = formatMultipliers[format] * estimatedRecords;
  const adjustedSize = baseSize * typeMultipliers[type];

  // Add overhead for headers, formatting, etc.
  const overhead = format === 'pdf' ? 50000 : 10000; // 50KB for PDF, 10KB for others
  
  return Math.round(adjustedSize + overhead);
}

/**
 * Determines if a report type requires admin privileges
 */
export function requiresAdminAccess(type: ReportType): boolean {
  const adminOnlyTypes: ReportType[] = ['payroll', 'performance', 'employee', 'department', 'compliance'];
  return adminOnlyTypes.includes(type);
}

/**
 * Gets suggested recipients for a report based on type and visibility
 */
export function getSuggestedRecipients(
  type: ReportType,
  visibility: Report['visibility'],
  departments?: string[]
): string[] {
  const recipients: string[] = [];

  // Always include admin for admin-only reports
  if (requiresAdminAccess(type)) {
    recipients.push('admin@company.com');
  }

  // Add HR for most report types
  if (['attendance', 'leave', 'performance', 'employee', 'compliance'].includes(type)) {
    recipients.push('hr@company.com');
  }

  // Add finance for payroll reports
  if (type === 'payroll') {
    recipients.push('finance@company.com');
  }

  // Add department managers for department-specific reports
  if (visibility === 'department' && departments) {
    departments.forEach(dept => {
      recipients.push(`${dept.toLowerCase()}-manager@company.com`);
    });
  }

  return recipients;
}

/**
 * Formats report parameters for display
 */
export function formatReportParametersForDisplay(parameters: ReportParameters): Record<string, any> {
  const formatted: Record<string, any> = {};

  // Date range
  formatted['Date Range'] = formatDateRange(
    parameters.date_range.start_date,
    parameters.date_range.end_date
  );

  // Filters
  if (parameters.employee_ids && parameters.employee_ids.length > 0) {
    formatted['Employees'] = `${parameters.employee_ids.length} selected`;
  }

  if (parameters.department_ids && parameters.department_ids.length > 0) {
    formatted['Departments'] = parameters.department_ids.join(', ');
  }

  // Type-specific parameters
  if (parameters.attendance_params) {
    const ap = parameters.attendance_params;
    formatted['Grouping'] = ap.group_by;
    formatted['Include Overtime'] = ap.include_overtime ? 'Yes' : 'No';
    formatted['Include Breaks'] = ap.include_breaks ? 'Yes' : 'No';
  }

  if (parameters.payroll_params) {
    const pp = parameters.payroll_params;
    formatted['Currency'] = pp.currency_format;
    formatted['Include Tax Details'] = pp.include_tax_details ? 'Yes' : 'No';
    formatted['Year to Date'] = pp.show_year_to_date ? 'Yes' : 'No';
  }

  if (parameters.leave_params) {
    const lp = parameters.leave_params;
    formatted['Leave Types'] = lp.leave_types.join(', ');
    formatted['Show Balance'] = lp.show_balance ? 'Yes' : 'No';
  }

  return formatted;
}

/**
 * Validates report scheduling parameters
 */
export function validateScheduleParameters(schedule: {
  frequency: string;
  schedule_time: string;
  recipients: string[];
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate frequency
  const validFrequencies = ['once', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
  if (!validFrequencies.includes(schedule.frequency)) {
    errors.push('Invalid frequency selected');
  }

  // Validate time format (HH:mm)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(schedule.schedule_time)) {
    errors.push('Invalid time format. Use HH:mm format');
  }

  // Validate recipients
  if (schedule.recipients.length === 0) {
    errors.push('At least one recipient is required');
  }

  schedule.recipients.forEach((email, index) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push(`Invalid email format at position ${index + 1}: ${email}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generates report summary statistics
 */
export function generateReportSummary(reports: Report[]): {
  totalReports: number;
  completedReports: number;
  totalDownloads: number;
  totalSize: number;
  popularTypes: Array<{ type: ReportType; count: number }>;
  recentActivity: number;
} {
  const totalReports = reports.length;
  const completedReports = reports.filter(r => r.status === 'completed').length;
  const totalDownloads = reports.reduce((sum, r) => sum + r.download_count, 0);
  const totalSize = reports.reduce((sum, r) => sum + (r.file_size || 0), 0);

  // Calculate popular types
  const typeCounts: Record<string, number> = {};
  reports.forEach(r => {
    typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
  });

  const popularTypes = Object.entries(typeCounts)
    .map(([type, count]) => ({ type: type as ReportType, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate recent activity (reports created in last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentActivity = reports.filter(r => 
    new Date(r.created_at) > sevenDaysAgo
  ).length;

  return {
    totalReports,
    completedReports,
    totalDownloads,
    totalSize,
    popularTypes,
    recentActivity
  };
}

/**
 * Filters reports based on user permissions and criteria
 */
export function filterReportsForUser(
  reports: Report[],
  userRole: 'admin' | 'hr' | 'manager' | 'employee',
  userDepartment?: string,
  userId?: string,
  searchTerm?: string,
  reportType?: ReportType,
  status?: string
): Report[] {
  return reports.filter(report => {
    // Check access permissions
    if (userRole !== 'admin' && userRole !== 'hr') {
      switch (report.visibility) {
        case 'private':
          if (!report.accessible_employees.includes(userId || '')) {
            return false;
          }
          break;
        case 'department':
          if (!report.accessible_departments.includes(userDepartment || '')) {
            return false;
          }
          break;
        case 'role_based':
          if (!report.accessible_roles.includes(userRole)) {
            return false;
          }
          break;
      }
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        report.title.toLowerCase().includes(searchLower) ||
        report.description?.toLowerCase().includes(searchLower) ||
        report.type.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) {
        return false;
      }
    }

    // Filter by report type
    if (reportType && reportType !== 'all' && report.type !== reportType) {
      return false;
    }

    // Filter by status
    if (status && status !== 'all' && report.status !== status) {
      return false;
    }

    return true;
  });
}

/**
 * Exports report data in different formats
 */
export function exportReportData(
  data: any[],
  format: ReportFormat,
  filename: string
): { success: boolean; message: string; downloadUrl?: string } {
  try {
    switch (format) {
      case 'csv':
        return exportToCSV(data, filename);
      case 'json':
        return exportToJSON(data, filename);
      case 'excel':
        return exportToExcel(data, filename);
      case 'pdf':
        return exportToPDF(data, filename);
      default:
        return { success: false, message: 'Unsupported format' };
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

function exportToCSV(data: any[], filename: string) {
  // Mock CSV export
  console.log(`Exporting ${data.length} records to CSV: ${filename}`);
  return { 
    success: true, 
    message: 'CSV export completed', 
    downloadUrl: `/downloads/${filename}` 
  };
}

function exportToJSON(data: any[], filename: string) {
  // Mock JSON export
  console.log(`Exporting ${data.length} records to JSON: ${filename}`);
  return { 
    success: true, 
    message: 'JSON export completed', 
    downloadUrl: `/downloads/${filename}` 
  };
}

function exportToExcel(data: any[], filename: string) {
  // Mock Excel export
  console.log(`Exporting ${data.length} records to Excel: ${filename}`);
  return { 
    success: true, 
    message: 'Excel export completed', 
    downloadUrl: `/downloads/${filename}` 
  };
}

function exportToPDF(data: any[], filename: string) {
  // Mock PDF export
  console.log(`Exporting ${data.length} records to PDF: ${filename}`);
  return { 
    success: true, 
    message: 'PDF export completed', 
    downloadUrl: `/downloads/${filename}` 
  };
}
