import { 
  Document, 
  DocumentCategory, 
  DocumentUploadRequest,
  DOCUMENT_CATEGORIES,
  getFileIcon,
  formatFileSize
} from "@/types/documents";

/**
 * Validates file type against allowed document types
 */
export function validateFileType(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = [
    // PDF
    'application/pdf',
    // Word Documents
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Excel Spreadsheets
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // PowerPoint Presentations
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Text files
    'text/plain',
    'text/csv',
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-zip-compressed',
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not supported. Please upload PDF, Word, Excel, PowerPoint, Image, or Archive files.`
    };
  }

  return { isValid: true };
}

/**
 * Validates file size against maximum allowed size (50MB)
 */
export function validateFileSize(file: File): { isValid: boolean; error?: string } {
  const maxSizeInBytes = 50 * 1024 * 1024; // 50MB
  
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File size ${formatFileSize(file.size)} exceeds the maximum allowed size of ${formatFileSize(maxSizeInBytes)}.`
    };
  }

  return { isValid: true };
}

/**
 * Validates document upload request data
 */
export function validateDocumentUpload(uploadData: Partial<DocumentUploadRequest>): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];

  // Required fields validation
  if (!uploadData.title?.trim()) {
    errors.push("Document title is required");
  }

  if (!uploadData.category) {
    errors.push("Document category is required");
  }

  if (!uploadData.file) {
    errors.push("File is required");
  }

  if (!uploadData.visibility) {
    errors.push("Visibility setting is required");
  }

  // File validation
  if (uploadData.file) {
    const fileTypeValidation = validateFileType(uploadData.file);
    if (!fileTypeValidation.isValid) {
      errors.push(fileTypeValidation.error!);
    }

    const fileSizeValidation = validateFileSize(uploadData.file);
    if (!fileSizeValidation.isValid) {
      errors.push(fileSizeValidation.error!);
    }
  }

  // Title length validation
  if (uploadData.title && uploadData.title.length > 200) {
    errors.push("Document title must be less than 200 characters");
  }

  // Description length validation
  if (uploadData.description && uploadData.description.length > 1000) {
    errors.push("Document description must be less than 1000 characters");
  }

  // Access control validation
  if (uploadData.visibility === 'private' && 
      (!uploadData.accessible_employees || uploadData.accessible_employees.length === 0) &&
      (!uploadData.accessible_roles || uploadData.accessible_roles.length === 0)) {
    errors.push("Private documents must have at least one accessible role or employee specified");
  }

  if (uploadData.visibility === 'department' && 
      (!uploadData.accessible_departments || uploadData.accessible_departments.length === 0)) {
    errors.push("Department-restricted documents must have at least one department specified");
  }

  if (uploadData.visibility === 'role_based' && 
      (!uploadData.accessible_roles || uploadData.accessible_roles.length === 0)) {
    errors.push("Role-based documents must have at least one role specified");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generates suggested tags based on document title, category, and file name
 */
export function generateSuggestedTags(
  title: string, 
  category: DocumentCategory, 
  fileName?: string
): string[] {
  const tags: string[] = [];
  
  // Add category-based tags
  const categoryConfig = DOCUMENT_CATEGORIES[category];
  if (categoryConfig) {
    tags.push(category);
    
    // Add subcategory suggestions based on title
    categoryConfig.subcategories.forEach(subcategory => {
      if (title.toLowerCase().includes(subcategory.toLowerCase())) {
        tags.push(subcategory.toLowerCase().replace(/\s+/g, '_'));
      }
    });
  }

  // Extract meaningful words from title
  const titleWords = title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !isCommonWord(word));
  
  tags.push(...titleWords.slice(0, 3)); // Limit to 3 words from title

  // Add file type tag
  if (fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension) {
      tags.push(extension);
    }
  }

  // Remove duplicates and return
  return [...new Set(tags)];
}

/**
 * Checks if a word is a common word that shouldn't be used as a tag
 */
function isCommonWord(word: string): boolean {
  const commonWords = [
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 
    'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 
    'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 
    'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'document',
    'file', 'pdf', 'doc', 'form', 'report', 'letter', 'certificate'
  ];
  
  return commonWords.includes(word.toLowerCase());
}

/**
 * Suggests appropriate subcategory based on document title and content
 */
export function suggestSubcategory(title: string, category: DocumentCategory): string | null {
  const categoryConfig = DOCUMENT_CATEGORIES[category];
  if (!categoryConfig) return null;

  const titleLower = title.toLowerCase();
  
  // Find matching subcategory based on keywords
  for (const subcategory of categoryConfig.subcategories) {
    const subcategoryLower = subcategory.toLowerCase();
    const keywords = subcategoryLower.split(/\s+/);
    
    if (keywords.some(keyword => titleLower.includes(keyword))) {
      return subcategory;
    }
  }

  return null;
}

/**
 * Determines if a document should be marked as confidential based on category and title
 */
export function shouldBeConfidential(title: string, category: DocumentCategory): boolean {
  const confidentialKeywords = [
    'salary', 'confidential', 'private', 'personal', 'medical', 'health',
    'disciplinary', 'performance', 'appraisal', 'termination', 'resignation',
    'legal', 'contract', 'agreement', 'nda', 'non-disclosure'
  ];

  const titleLower = title.toLowerCase();
  
  // Check for confidential keywords in title
  if (confidentialKeywords.some(keyword => titleLower.includes(keyword))) {
    return true;
  }

  // Certain categories are typically confidential
  const confidentialCategories: DocumentCategory[] = ['payroll', 'compliance'];
  if (confidentialCategories.includes(category)) {
    return true;
  }

  return false;
}

/**
 * Generates a unique file name to prevent conflicts
 */
export function generateUniqueFileName(originalFileName: string, employeeId?: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const extension = originalFileName.split('.').pop();
  const nameWithoutExtension = originalFileName.replace(/\.[^/.]+$/, "");
  
  // Sanitize filename
  const sanitizedName = nameWithoutExtension
    .replace(/[^a-zA-Z0-9\-_]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();

  const prefix = employeeId ? `${employeeId}_` : '';
  
  return `${prefix}${sanitizedName}_${timestamp}.${extension}`;
}

/**
 * Categorizes documents automatically based on file name and content analysis
 */
export function autoCategorizDocument(fileName: string, title?: string): {
  suggestedCategory: DocumentCategory;
  confidence: number;
} {
  const fileNameLower = fileName.toLowerCase();
  const titleLower = title?.toLowerCase() || '';
  const combinedText = `${fileNameLower} ${titleLower}`;

  const categoryKeywords: Record<DocumentCategory, string[]> = {
    personal: ['id', 'passport', 'license', 'address', 'photo', 'personal', 'contact'],
    employment: ['contract', 'offer', 'employment', 'job', 'appointment', 'resignation'],
    payroll: ['salary', 'pay', 'form16', 'tax', 'pf', 'provident', 'esi', 'payroll'],
    benefits: ['insurance', 'medical', 'health', 'benefit', 'claim', 'policy'],
    compliance: ['audit', 'compliance', 'legal', 'license', 'certificate', 'regulation'],
    training: ['training', 'course', 'certificate', 'skill', 'development', 'learning'],
    policies: ['policy', 'procedure', 'guideline', 'handbook', 'code', 'conduct'],
    forms: ['form', 'application', 'request', 'template', 'format'],
    certificates: ['certificate', 'certification', 'award', 'achievement', 'diploma'],
    other: ['misc', 'other', 'general', 'document']
  };

  let bestMatch: DocumentCategory = 'other';
  let highestScore = 0;

  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    const score = keywords.reduce((acc, keyword) => {
      if (combinedText.includes(keyword)) {
        return acc + 1;
      }
      return acc;
    }, 0);

    if (score > highestScore) {
      highestScore = score;
      bestMatch = category as DocumentCategory;
    }
  });

  const confidence = Math.min((highestScore / 3) * 100, 100); // Max 100% confidence

  return {
    suggestedCategory: bestMatch,
    confidence
  };
}

/**
 * Formats document metadata for display
 */
export function formatDocumentMetadata(document: Document): {
  size: string;
  type: string;
  icon: string;
  uploadedDate: string;
  lastAccessed?: string;
} {
  return {
    size: formatFileSize(document.file_size),
    type: document.file_type.split('/').pop()?.toUpperCase() || 'UNKNOWN',
    icon: getFileIcon(document.file_type),
    uploadedDate: new Date(document.uploaded_date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    lastAccessed: document.last_accessed ? new Date(document.last_accessed).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : undefined
  };
}

/**
 * Checks if user has permission to access a document
 */
export function hasDocumentAccess(
  document: Document,
  userRole: 'admin' | 'employee',
  userDepartment?: string,
  userId?: string
): boolean {
  // Admins have access to all documents except employee-specific private ones
  if (userRole === 'admin') {
    if (document.visibility === 'private' && 
        document.employee_id && 
        document.employee_id !== userId) {
      return false;
    }
    return true;
  }

  // Check visibility rules for employees
  switch (document.visibility) {
    case 'public':
      return true;
    
    case 'private':
      return document.accessible_employees.includes(userId || '') ||
             document.employee_id === userId;
    
    case 'department':
      return document.accessible_departments.includes(userDepartment || '');
    
    case 'role_based':
      return document.accessible_roles.includes(userRole);
    
    default:
      return false;
  }
}

/**
 * Filters documents based on user permissions and search criteria
 */
export function filterDocuments(
  documents: Document[],
  userRole: 'admin' | 'employee',
  userDepartment?: string,
  userId?: string,
  searchTerm?: string,
  category?: DocumentCategory | 'all'
): Document[] {
  return documents.filter(document => {
    // Check access permissions
    if (!hasDocumentAccess(document, userRole, userDepartment, userId)) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        document.title.toLowerCase().includes(searchLower) ||
        document.description?.toLowerCase().includes(searchLower) ||
        document.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        document.file_name.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) {
        return false;
      }
    }

    // Filter by category
    if (category && category !== 'all' && document.category !== category) {
      return false;
    }

    return true;
  });
}
