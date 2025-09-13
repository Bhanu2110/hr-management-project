import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Edit, 
  Eye,
  Trash2,
  Check,
  X,
  FileText,
  Image,
  FileSpreadsheet,
  Presentation,
  Archive,
  File,
  Users,
  Shield,
  Calendar,
  AlertTriangle,
  BarChart3,
  Clock
} from "lucide-react";
import { 
  Document, 
  DocumentCategory, 
  DocumentUploadRequest,
  DOCUMENT_CATEGORIES, 
  DOCUMENT_STATUS_COLORS,
  VISIBILITY_OPTIONS,
  formatFileSize,
  getFileIcon
} from "@/types/documents";

interface DocumentManagementProps {
  employees?: Array<{
    id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    department: string;
    position: string;
  }>;
}

export function DocumentManagement({ employees = [] }: DocumentManagementProps) {
  const [activeTab, setActiveTab] = useState("all-documents");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterVisibility, setFilterVisibility] = useState<string>("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploadData, setUploadData] = useState<Partial<DocumentUploadRequest>>({
    title: "",
    description: "",
    category: "other",
    subcategory: "",
    tags: [],
    visibility: "public",
    accessible_roles: ["employee"],
    accessible_departments: [],
    accessible_employees: [],
    is_confidential: false,
  });

  // Mock document data for admin view
  const mockDocuments: Document[] = [
    {
      id: "1",
      title: "Employment Contract - John Doe",
      description: "Official employment contract document for John Doe",
      file_name: "employment_contract_john_doe.pdf",
      file_size: 245760,
      file_type: "application/pdf",
      file_url: "/documents/employment_contract_john_doe.pdf",
      category: "employment",
      subcategory: "Employment Contract",
      tags: ["contract", "employment", "john_doe"],
      visibility: "private",
      accessible_roles: ["employee"],
      accessible_departments: [],
      accessible_employees: ["EMP001"],
      employee_id: "EMP001",
      employee_name: "John Doe",
      version: 1,
      is_active: true,
      is_confidential: false,
      approval_status: "approved",
      approved_by: "HR Manager",
      approved_date: "2024-01-15T10:00:00Z",
      uploaded_by: "hr_admin",
      uploaded_by_name: "HR Admin",
      uploaded_date: "2024-01-10T10:00:00Z",
      access_count: 5,
      created_at: "2024-01-10T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      title: "Company Policy Update 2024",
      description: "Updated company policies for 2024",
      file_name: "company_policy_update_2024.pdf",
      file_size: 892456,
      file_type: "application/pdf",
      file_url: "/documents/company_policy_update_2024.pdf",
      category: "policies",
      subcategory: "HR Policies",
      tags: ["policy", "update", "2024"],
      visibility: "public",
      accessible_roles: ["employee", "admin"],
      accessible_departments: [],
      accessible_employees: [],
      version: 2,
      is_active: true,
      is_confidential: false,
      approval_status: "pending",
      uploaded_by: "hr_admin",
      uploaded_by_name: "HR Admin",
      uploaded_date: "2024-12-01T10:00:00Z",
      access_count: 0,
      created_at: "2024-12-01T10:00:00Z",
      updated_at: "2024-12-01T10:00:00Z",
    },
    {
      id: "3",
      title: "Confidential Salary Report Q4 2024",
      description: "Quarterly salary analysis and budget report",
      file_name: "salary_report_q4_2024.xlsx",
      file_size: 567890,
      file_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      file_url: "/documents/salary_report_q4_2024.xlsx",
      category: "payroll",
      subcategory: "Reports",
      tags: ["salary", "report", "confidential", "q4"],
      visibility: "role_based",
      accessible_roles: ["admin"],
      accessible_departments: [],
      accessible_employees: [],
      version: 1,
      is_active: true,
      is_confidential: true,
      approval_status: "approved",
      approved_by: "CEO",
      approved_date: "2024-11-30T10:00:00Z",
      uploaded_by: "finance_admin",
      uploaded_by_name: "Finance Admin",
      uploaded_date: "2024-11-25T10:00:00Z",
      access_count: 3,
      created_at: "2024-11-25T10:00:00Z",
      updated_at: "2024-11-30T10:00:00Z",
    },
    {
      id: "4",
      title: "Training Material - React Development",
      description: "Complete training materials for React development course",
      file_name: "react_training_materials.zip",
      file_size: 15678900,
      file_type: "application/zip",
      file_url: "/documents/react_training_materials.zip",
      category: "training",
      subcategory: "Training Materials",
      tags: ["training", "react", "development", "course"],
      visibility: "department",
      accessible_roles: ["employee"],
      accessible_departments: ["Engineering"],
      accessible_employees: [],
      version: 3,
      is_active: true,
      is_confidential: false,
      expiry_date: "2025-06-30T23:59:59Z",
      approval_status: "approved",
      approved_by: "Training Manager",
      approved_date: "2024-10-01T10:00:00Z",
      uploaded_by: "training_admin",
      uploaded_by_name: "Training Admin",
      uploaded_date: "2024-09-15T10:00:00Z",
      access_count: 25,
      created_at: "2024-09-15T10:00:00Z",
      updated_at: "2024-10-01T10:00:00Z",
    },
    {
      id: "5",
      title: "Employee Handbook 2024",
      description: "Complete employee handbook with all policies and procedures",
      file_name: "employee_handbook_2024.pdf",
      file_size: 2345678,
      file_type: "application/pdf",
      file_url: "/documents/employee_handbook_2024.pdf",
      category: "policies",
      subcategory: "Employee Handbook",
      tags: ["handbook", "policies", "procedures", "2024"],
      visibility: "public",
      accessible_roles: ["employee", "admin"],
      accessible_departments: [],
      accessible_employees: [],
      version: 1,
      is_active: true,
      is_confidential: false,
      approval_status: "rejected",
      rejection_reason: "Needs legal review for compliance updates",
      uploaded_by: "hr_admin",
      uploaded_by_name: "HR Admin",
      uploaded_date: "2024-11-20T10:00:00Z",
      access_count: 0,
      created_at: "2024-11-20T10:00:00Z",
      updated_at: "2024-11-25T10:00:00Z",
    },
  ];

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
    const matchesStatus = filterStatus === "all" || doc.approval_status === filterStatus;
    const matchesVisibility = filterVisibility === "all" || doc.visibility === filterVisibility;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesVisibility;
  });

  const getIconComponent = (fileType: string) => {
    const iconName = getFileIcon(fileType);
    const iconMap: Record<string, any> = {
      FileText,
      Image,
      FileSpreadsheet,
      Presentation,
      Archive,
      File,
    };
    return iconMap[iconName] || File;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleUpload = () => {
    console.log("Uploading document with data:", uploadData);
    setIsUploadDialogOpen(false);
    setUploadData({
      title: "",
      description: "",
      category: "other",
      subcategory: "",
      tags: [],
      visibility: "public",
      accessible_roles: ["employee"],
      accessible_departments: [],
      accessible_employees: [],
      is_confidential: false,
    });
  };

  const handleApprove = (id: string) => {
    console.log("Approving document:", id);
  };

  const handleReject = (id: string) => {
    console.log("Rejecting document:", id);
  };

  const handleDelete = (id: string) => {
    console.log("Deleting document:", id);
  };

  const handleDownload = (document: Document) => {
    console.log("Downloading document:", document.file_name);
  };

  // Calculate statistics
  const stats = {
    total: mockDocuments.length,
    pending: mockDocuments.filter(d => d.approval_status === 'pending').length,
    confidential: mockDocuments.filter(d => d.is_confidential).length,
    expired: mockDocuments.filter(d => d.expiry_date && new Date(d.expiry_date) < new Date()).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">
            Manage all company documents, uploads, and access permissions
          </p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
              <DialogDescription>
                Upload a new document and configure its access permissions
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title</Label>
                  <Input
                    id="title"
                    value={uploadData.title}
                    onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter document title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={uploadData.category} 
                    onValueChange={(value) => setUploadData(prev => ({ ...prev, category: value as DocumentCategory }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DOCUMENT_CATEGORIES).map(([key, category]) => (
                        <SelectItem key={key} value={key}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={uploadData.description}
                  onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter document description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select 
                    value={uploadData.visibility} 
                    onValueChange={(value) => setUploadData(prev => ({ ...prev, visibility: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VISIBILITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={uploadData.subcategory}
                    onChange={(e) => setUploadData(prev => ({ ...prev, subcategory: e.target.value }))}
                    placeholder="Enter subcategory"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Access Permissions</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="confidential"
                      checked={uploadData.is_confidential}
                      onCheckedChange={(checked) => 
                        setUploadData(prev => ({ ...prev, is_confidential: !!checked }))
                      }
                    />
                    <Label htmlFor="confidential" className="text-sm">
                      Mark as confidential
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Accessible Roles</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="role-admin"
                            checked={uploadData.accessible_roles?.includes('admin')}
                            onCheckedChange={(checked) => {
                              const roles = uploadData.accessible_roles || [];
                              if (checked) {
                                setUploadData(prev => ({ 
                                  ...prev, 
                                  accessible_roles: [...roles.filter(r => r !== 'admin'), 'admin'] 
                                }));
                              } else {
                                setUploadData(prev => ({ 
                                  ...prev, 
                                  accessible_roles: roles.filter(r => r !== 'admin') 
                                }));
                              }
                            }}
                          />
                          <Label htmlFor="role-admin" className="text-sm">Admin</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="role-employee"
                            checked={uploadData.accessible_roles?.includes('employee')}
                            onCheckedChange={(checked) => {
                              const roles = uploadData.accessible_roles || [];
                              if (checked) {
                                setUploadData(prev => ({ 
                                  ...prev, 
                                  accessible_roles: [...roles.filter(r => r !== 'employee'), 'employee'] 
                                }));
                              } else {
                                setUploadData(prev => ({ 
                                  ...prev, 
                                  accessible_roles: roles.filter(r => r !== 'employee') 
                                }));
                              }
                            }}
                          />
                          <Label htmlFor="role-employee" className="text-sm">Employee</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employee-select" className="text-sm">Specific Employee (Optional)</Label>
                      <Select 
                        value={uploadData.employee_id || ""} 
                        onValueChange={(value) => setUploadData(prev => ({ ...prev, employee_id: value || undefined }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Employees</SelectItem>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.employee_id}>
                              {employee.first_name} {employee.last_name} ({employee.employee_id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadData(prev => ({ ...prev, file }));
                    }
                  }}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.rar"
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, Word, Excel, PowerPoint, Images, Archives
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={!uploadData.title || !uploadData.file}>
                Upload Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.confidential}</p>
                <p className="text-sm text-muted-foreground">Confidential</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.expired}</p>
                <p className="text-sm text-muted-foreground">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents by title, description, employee, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(DOCUMENT_CATEGORIES).map(([key, category]) => (
                  <SelectItem key={key} value={key}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="not_required">No Approval</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterVisibility} onValueChange={setFilterVisibility}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visibility</SelectItem>
                {VISIBILITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((document) => {
                const IconComponent = getIconComponent(document.file_type);
                return (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-muted rounded">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{document.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatFileSize(document.file_size)}</span>
                            {document.is_confidential && (
                              <>
                                <span>•</span>
                                <Badge variant="destructive" className="text-xs">
                                  Confidential
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{DOCUMENT_CATEGORIES[document.category]?.name}</p>
                        {document.subcategory && (
                          <p className="text-xs text-muted-foreground">{document.subcategory}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {document.employee_name ? (
                        <div>
                          <p className="font-medium">{document.employee_name}</p>
                          <p className="text-xs text-muted-foreground">{document.employee_id}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">All Employees</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {VISIBILITY_OPTIONS.find(v => v.value === document.visibility)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={DOCUMENT_STATUS_COLORS[document.approval_status]}>
                        {document.approval_status.charAt(0).toUpperCase() + document.approval_status.slice(1).replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{formatDate(document.uploaded_date)}</p>
                        <p className="text-xs text-muted-foreground">by {document.uploaded_by_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {document.approval_status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleApprove(document.id)}
                              className="text-green-600"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleReject(document.id)}
                              className="text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(document.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
