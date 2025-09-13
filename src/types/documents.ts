export interface Document {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  thumbnail_url?: string;
  
  // Document categorization
  category: DocumentCategory;
  subcategory?: string;
  tags: string[];
  
  // Access control
  visibility: 'public' | 'private' | 'department' | 'role_based';
  accessible_roles: ('admin' | 'employee')[];
  accessible_departments: string[];
  accessible_employees: string[];
  
  // Employee association
  employee_id?: string;
  employee_name?: string;
  
  // Document metadata
  version: number;
  is_active: boolean;
  is_confidential: boolean;
  expiry_date?: string;
  
  // Approval workflow
  approval_status: 'pending' | 'approved' | 'rejected' | 'not_required';
  approved_by?: string;
  approved_date?: string;
  rejection_reason?: string;
  
  // Upload information
  uploaded_by: string;
  uploaded_by_name: string;
  uploaded_date: string;
  last_accessed?: string;
  access_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export type DocumentCategory = 
  | 'personal'
  | 'employment'
  | 'payroll'
  | 'benefits'
  | 'compliance'
  | 'training'
  | 'policies'
  | 'forms'
  | 'certificates'
  | 'other';

export interface DocumentCategoryConfig {
  id: DocumentCategory;
  name: string;
  description: string;
  icon: string;
  subcategories: string[];
  required_for_employees: boolean;
  admin_only: boolean;
}

export interface DocumentUploadRequest {
  title: string;
  description?: string;
  category: DocumentCategory;
  subcategory?: string;
  tags: string[];
  visibility: Document['visibility'];
  accessible_roles: Document['accessible_roles'];
  accessible_departments: string[];
  accessible_employees: string[];
  employee_id?: string;
  is_confidential: boolean;
  expiry_date?: string;
  file: File;
}

export interface DocumentFilter {
  category?: DocumentCategory;
  subcategory?: string;
  visibility?: Document['visibility'];
  approval_status?: Document['approval_status'];
  employee_id?: string;
  department?: string;
  uploaded_by?: string;
  date_range?: {
    start: string;
    end: string;
  };
  tags?: string[];
  is_confidential?: boolean;
  is_active?: boolean;
}

export interface DocumentStats {
  total_documents: number;
  pending_approval: number;
  confidential_documents: number;
  expired_documents: number;
  documents_by_category: Record<DocumentCategory, number>;
  recent_uploads: number;
  total_file_size: number;
}

export const DOCUMENT_CATEGORIES: Record<DocumentCategory, {
  name: string;
  description: string;
  icon: string;
  subcategories: string[];
  required_for_employees: boolean;
  admin_only: boolean;
}> = {
  personal: {
    name: 'Personal Documents',
    description: 'Personal identification and contact documents',
    icon: 'User',
    subcategories: ['ID Proof', 'Address Proof', 'Photos', 'Emergency Contacts'],
    required_for_employees: true,
    admin_only: false,
  },
  employment: {
    name: 'Employment Documents',
    description: 'Job-related documents and contracts',
    icon: 'Briefcase',
    subcategories: ['Offer Letter', 'Employment Contract', 'Job Description', 'Resignation Letter'],
    required_for_employees: true,
    admin_only: false,
  },
  payroll: {
    name: 'Payroll Documents',
    description: 'Salary and tax-related documents',
    icon: 'DollarSign',
    subcategories: ['Salary Slips', 'Form 16', 'Tax Declarations', 'Bank Details'],
    required_for_employees: false,
    admin_only: false,
  },
  benefits: {
    name: 'Benefits & Insurance',
    description: 'Employee benefits and insurance documents',
    icon: 'Shield',
    subcategories: ['Health Insurance', 'Life Insurance', 'PF Documents', 'Leave Policies'],
    required_for_employees: false,
    admin_only: false,
  },
  compliance: {
    name: 'Compliance Documents',
    description: 'Legal and regulatory compliance documents',
    icon: 'FileCheck',
    subcategories: ['Licenses', 'Certifications', 'Audit Reports', 'Legal Documents'],
    required_for_employees: false,
    admin_only: true,
  },
  training: {
    name: 'Training & Development',
    description: 'Training materials and certifications',
    icon: 'GraduationCap',
    subcategories: ['Training Materials', 'Certificates', 'Course Completion', 'Skill Assessments'],
    required_for_employees: false,
    admin_only: false,
  },
  policies: {
    name: 'Policies & Procedures',
    description: 'Company policies and procedure documents',
    icon: 'BookOpen',
    subcategories: ['HR Policies', 'IT Policies', 'Safety Procedures', 'Code of Conduct'],
    required_for_employees: false,
    admin_only: false,
  },
  forms: {
    name: 'Forms & Templates',
    description: 'Downloadable forms and templates',
    icon: 'FileText',
    subcategories: ['Leave Forms', 'Expense Forms', 'Request Forms', 'Templates'],
    required_for_employees: false,
    admin_only: false,
  },
  certificates: {
    name: 'Certificates',
    description: 'Professional and educational certificates',
    icon: 'Award',
    subcategories: ['Educational Certificates', 'Professional Certificates', 'Training Certificates', 'Awards'],
    required_for_employees: false,
    admin_only: false,
  },
  other: {
    name: 'Other Documents',
    description: 'Miscellaneous documents',
    icon: 'Folder',
    subcategories: ['Miscellaneous', 'Archive', 'Temporary'],
    required_for_employees: false,
    admin_only: false,
  },
};

export const DOCUMENT_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  not_required: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public', description: 'Visible to all employees' },
  { value: 'private', label: 'Private', description: 'Visible only to specific users' },
  { value: 'department', label: 'Department', description: 'Visible to specific departments' },
  { value: 'role_based', label: 'Role Based', description: 'Visible based on user roles' },
];

export const FILE_TYPE_ICONS: Record<string, string> = {
  'application/pdf': 'FileText',
  'application/msword': 'FileText',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'FileText',
  'application/vnd.ms-excel': 'FileSpreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'FileSpreadsheet',
  'application/vnd.ms-powerpoint': 'Presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'Presentation',
  'image/jpeg': 'Image',
  'image/jpg': 'Image',
  'image/png': 'Image',
  'image/gif': 'Image',
  'image/webp': 'Image',
  'text/plain': 'FileText',
  'text/csv': 'FileSpreadsheet',
  'application/zip': 'Archive',
  'application/x-rar-compressed': 'Archive',
  'default': 'File',
};

export function getFileIcon(fileType: string): string {
  return FILE_TYPE_ICONS[fileType] || FILE_TYPE_ICONS.default;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getDocumentCategoryIcon(category: DocumentCategory): string {
  return DOCUMENT_CATEGORIES[category]?.icon || 'Folder';
}
