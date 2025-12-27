import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Plus,
    Search,
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
    File,
    Shield,
    Calendar,
    AlertTriangle,
    Clock,
    MoreVertical,
    Filter,
    Users,
    FolderOpen,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RefreshCw,
    FileCheck,
    FilePlus,
    LayoutGrid,
    List,
    Loader2
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
import {
    fetchAllDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
    approveDocument,
    rejectDocument,
    getDocumentStatistics
} from "@/api/documents";
import { useToast } from "@/hooks/use-toast";

interface AdminDocumentManagementProps {
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


type ViewMode = 'grid' | 'list';

export function AdminDocumentManagement({ employees = [] }: AdminDocumentManagementProps) {
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Error boundary
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            console.error('Component error:', event.error);
            setHasError(true);
            setErrorMessage(event.error?.message || 'Unknown error');
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    if (hasError) {
        return (
            <div className="flex items-center justify-center h-64">
                <Card className="max-w-md">
                    <CardContent className="p-6">
                        <div className="text-center space-y-4">
                            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                            <h2 className="text-xl font-semibold">Error Loading Documents</h2>
                            <p className="text-muted-foreground">{errorMessage}</p>
                            <Button onClick={() => window.location.reload()}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reload Page
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("all-documents");
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterVisibility, setFilterVisibility] = useState<string>("all");
    const [filterEmployee, setFilterEmployee] = useState<string>("all");
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isAllEmployeesSelected, setIsAllEmployeesSelected] = useState(false);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        confidential: 0,
        byCategory: {} as Record<string, number>,
    });
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

    // Fetch documents on mount
    useEffect(() => {
        loadDocuments();
        loadStatistics();
    }, []);

    const loadDocuments = async () => {
        try {
            setIsLoading(true);
            const data = await fetchAllDocuments();
            setDocuments(data);
        } catch (error: any) {
            console.error('Error loading documents:', error);
            setDocuments([]); // Set empty array on error
            toast({
                title: "Error",
                description: error?.message || "Failed to load documents",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const statistics = await getDocumentStatistics();
            setStats(statistics);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    };

    const filteredDocuments = documents.filter((doc) => {
        const matchesSearch =
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
        const matchesStatus = filterStatus === "all" || doc.approval_status === filterStatus;
        const matchesVisibility = filterVisibility === "all" || doc.visibility === filterVisibility;
        const matchesEmployee = filterEmployee === "all" || doc.employee_id === filterEmployee;

        return matchesSearch && matchesCategory && matchesStatus && matchesVisibility && matchesEmployee;
    });

    const getIconComponent = (fileType: string) => {
        const iconName = getFileIcon(fileType);
        const iconMap: Record<string, any> = {
            FileText,
            Image,
            FileSpreadsheet,
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

    const handleUpload = async () => {
        if (!uploadData.title || !uploadData.file) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsUploading(true);
            const targetEmployeeCount = uploadData.accessible_employees?.length || 0;
            
            await uploadDocument(uploadData as DocumentUploadRequest);

            toast({
                title: "Success",
                description: targetEmployeeCount > 0 
                    ? `Document uploaded and ${targetEmployeeCount} employee(s) notified`
                    : "Document uploaded successfully",
            });

            setIsUploadDialogOpen(false);
            resetUploadData();

            // Reload data
            await loadDocuments();
            await loadStatistics();
        } catch (error) {
            console.error('Error uploading document:', error);
            toast({
                title: "Error",
                description: "Failed to upload document",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const resetUploadData = () => {
        setIsAllEmployeesSelected(false);
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

    const handleApprove = async (id: string) => {
        try {
            await approveDocument(id, "Admin");
            toast({
                title: "Success",
                description: "Document approved successfully",
            });
            await loadDocuments();
            await loadStatistics();
        } catch (error) {
            console.error('Error approving document:', error);
            toast({
                title: "Error",
                description: "Failed to approve document",
                variant: "destructive",
            });
        }
    };

    const handleReject = async (id: string) => {
        try {
            await rejectDocument(id, "Admin");
            toast({
                title: "Success",
                description: "Document rejected successfully",
            });
            await loadDocuments();
            await loadStatistics();
        } catch (error) {
            console.error('Error rejecting document:', error);
            toast({
                title: "Error",
                description: "Failed to reject document",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this document?")) {
            return;
        }

        try {
            await deleteDocument(id);
            toast({
                title: "Success",
                description: "Document deleted successfully",
            });
            await loadDocuments();
            await loadStatistics();
        } catch (error) {
            console.error('Error deleting document:', error);
            toast({
                title: "Error",
                description: "Failed to delete document",
                variant: "destructive",
            });
        }
    };

    const handleDownload = async (document: Document) => {
        try {
            await downloadDocument(document.id);
        } catch (error) {
            console.error('Error downloading document:', error);
            toast({
                title: "Error",
                description: "Failed to download document",
                variant: "destructive",
            });
        }
    };

    const handleEdit = (document: Document) => {
        setSelectedDocument(document);
        setUploadData({
            title: document.title,
            description: document.description || "",
            category: document.category,
            subcategory: document.subcategory || "",
            tags: document.tags || [],
            visibility: document.visibility,
            accessible_roles: document.accessible_roles || [],
            accessible_departments: document.accessible_departments || [],
            accessible_employees: document.accessible_employees || [],
            employee_id: document.employee_id || undefined,
            is_confidential: document.is_confidential,
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedDocument || !uploadData.title) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsUploading(true);
            await updateDocument(selectedDocument.id, uploadData as DocumentUploadRequest);

            toast({
                title: "Success",
                description: "Document updated successfully",
            });

            setIsEditDialogOpen(false);
            setSelectedDocument(null);
            resetUploadData();

            // Reload data
            await loadDocuments();
            await loadStatistics();
        } catch (error) {
            console.error('Error updating document:', error);
            toast({
                title: "Error",
                description: "Failed to update document",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleView = (document: Document) => {
        // Open document in new tab
        if (document.file_url) {
            window.open(document.file_url, '_blank');
        } else {
            toast({
                title: "Error",
                description: "Document URL not found",
                variant: "destructive",
            });
        }
    };

    // Early return for loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading documents...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        Document Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage all employee documents, uploads, and access permissions
                    </p>
                </div>
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Document
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Upload New Document</DialogTitle>
                            <DialogDescription>
                                Upload a new document and configure its access permissions
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Document Title *</Label>
                                    <Input
                                        id="title"
                                        value={uploadData.title}
                                        onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Enter document title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
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
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subcategory">Subcategory</Label>
                                    <Select
                                        value={uploadData.subcategory || undefined}
                                        onValueChange={(value) => setUploadData(prev => ({ ...prev, subcategory: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select subcategory" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {uploadData.category && DOCUMENT_CATEGORIES[uploadData.category as DocumentCategory]?.subcategories.map((sub) => (
                                                <SelectItem key={sub} value={sub}>
                                                    {sub}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="visibility">Visibility *</Label>
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
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="employee-select">Assign to Employee (Optional)</Label>
                                <Combobox
                                    options={[
                                        { value: "all_employees", label: "📢 All Employees" },
                                        ...employees.map((employee) => ({
                                            value: employee.employee_id,
                                            label: `${employee.first_name} ${employee.last_name} (${employee.employee_id})`
                                        }))
                                    ]}
                                    value={isAllEmployeesSelected ? "all_employees" : (uploadData.employee_id || "")}
                                    onValueChange={(value) => {
                                        if (value === "all_employees") {
                                            setIsAllEmployeesSelected(true);
                                            setUploadData(prev => ({
                                                ...prev,
                                                employee_id: undefined,
                                                accessible_employees: employees.map(emp => emp.employee_id),
                                                visibility: 'private'
                                            }));
                                        } else {
                                            setIsAllEmployeesSelected(false);
                                            setUploadData(prev => ({
                                                ...prev,
                                                employee_id: value || undefined,
                                                accessible_employees: value ? [value] : [],
                                                visibility: value ? 'private' : prev.visibility
                                            }));
                                        }
                                    }}
                                    placeholder="Select employee"
                                    searchPlaceholder="Search employees..."
                                    emptyText="No employees found."
                                />
                                {isAllEmployeesSelected && (
                                    <p className="text-xs text-muted-foreground">
                                        Document will be sent to all {employees.length} employees
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="confidential"
                                    checked={uploadData.is_confidential}
                                    onCheckedChange={(checked) =>
                                        setUploadData(prev => ({ ...prev, is_confidential: !!checked }))
                                    }
                                />
                                <Label htmlFor="confidential" className="text-sm font-medium">
                                    Mark as confidential
                                </Label>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="file">Select File *</Label>
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
                                    Supported formats: PDF, Word, Excel, PowerPoint, Images, Archives (Max 10MB)
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpload} disabled={!uploadData.title || !uploadData.file || isUploading}>
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Document
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Document</DialogTitle>
                        <DialogDescription>
                            Update document details and permissions
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">Document Title *</Label>
                                <Input
                                    id="edit-title"
                                    value={uploadData.title}
                                    onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter document title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-category">Category *</Label>
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
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={uploadData.description}
                                onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter document description"
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-subcategory">Subcategory</Label>
                                <Select
                                    value={uploadData.subcategory || undefined}
                                    onValueChange={(value) => setUploadData(prev => ({ ...prev, subcategory: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select subcategory" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {uploadData.category && DOCUMENT_CATEGORIES[uploadData.category as DocumentCategory]?.subcategories.map((sub) => (
                                            <SelectItem key={sub} value={sub}>
                                                {sub}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-visibility">Visibility *</Label>
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
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-employee-select">Assign to Employee (Optional)</Label>
                            <Combobox
                                options={employees.map((employee) => ({
                                    value: employee.employee_id,
                                    label: `${employee.first_name} ${employee.last_name} (${employee.employee_id})`
                                }))}
                                value={uploadData.employee_id || ""}
                                onValueChange={(value) => setUploadData(prev => ({
                                    ...prev,
                                    employee_id: value || undefined,
                                    visibility: value ? 'private' : prev.visibility
                                }))}
                                placeholder="Select employee"
                                searchPlaceholder="Search employees..."
                                emptyText="No employees found."
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="edit-confidential"
                                checked={uploadData.is_confidential}
                                onCheckedChange={(checked) =>
                                    setUploadData(prev => ({ ...prev, is_confidential: !!checked }))
                                }
                            />
                            <Label htmlFor="edit-confidential" className="text-sm font-medium">
                                Mark as confidential
                            </Label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-file">Replace File (Optional)</Label>
                            <Input
                                id="edit-file"
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
                                Upload a new file to replace the existing one. Supported formats: PDF, Word, Excel, Images, etc.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={!uploadData.title || isUploading}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Update Document
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Total Documents</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full flex items-center justify-center">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Pending Approval</p>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full flex items-center justify-center">
                                <Clock className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Approved</p>
                                <p className="text-2xl font-bold">{stats.approved}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Confidential</p>
                                <p className="text-2xl font-bold">{stats.confidential}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full flex items-center justify-center">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="all-documents">All Documents</TabsTrigger>
                    <TabsTrigger value="pending-approval">
                        Pending Approval
                        {stats.pending > 0 && (
                            <Badge variant="destructive" className="ml-2">{stats.pending}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="by-category">By Category</TabsTrigger>
                    <TabsTrigger value="by-employee">By Employee</TabsTrigger>
                </TabsList>

                <TabsContent value="all-documents" className="space-y-4">
                    {/* Filters */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row gap-4">
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
                                <div className="flex gap-2 flex-wrap lg:flex-nowrap">
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
                                        </SelectContent>
                                    </Select>

                                    <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Employee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Employees</SelectItem>
                                            {employees.map((emp) => (
                                                <SelectItem key={emp.id} value={emp.employee_id}>
                                                    {emp.first_name} {emp.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <div className="flex gap-1 border rounded-md p-1">
                                        <Button
                                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <LayoutGrid className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents Display */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredDocuments.map((document) => {
                                const IconComponent = getIconComponent(document.file_type);
                                return (
                                    <Card key={document.id} className="hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                                                        <IconComponent className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <CardTitle className="text-base truncate">{document.title}</CardTitle>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {formatFileSize(document.file_size)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleView(document)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEdit(document)}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDownload(document)}>
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Download
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {document.approval_status === 'pending' && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleApprove(document.id)} className="text-green-600">
                                                                    <Check className="h-4 w-4 mr-2" />
                                                                    Approve
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleReject(document.id)} className="text-orange-600">
                                                                    <X className="h-4 w-4 mr-2" />
                                                                    Reject
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                            </>
                                                        )}
                                                        <DropdownMenuItem onClick={() => handleDelete(document.id)} className="text-red-600">
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {document.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {document.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {DOCUMENT_CATEGORIES[document.category]?.name}
                                                </Badge>
                                                {document.subcategory && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {document.subcategory}
                                                    </Badge>
                                                )}
                                                {document.is_confidential && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        <Shield className="h-3 w-3 mr-1" />
                                                        Confidential
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                {document.employee_name && (
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">
                                                            {document.employee_name} ({document.employee_id})
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                                                        {formatDate(document.uploaded_date)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t">
                                                <Badge className={DOCUMENT_STATUS_COLORS[document.approval_status]}>
                                                    {document.approval_status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                                    {document.approval_status === 'approved' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                                    {document.approval_status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                                                    {document.approval_status.charAt(0).toUpperCase() + document.approval_status.slice(1).replace('_', ' ')}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    v{document.version}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Document</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Uploaded</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredDocuments.map((document) => {
                                            const IconComponent = getIconComponent(document.file_type);
                                            return (
                                                <TableRow key={document.id} className="hover:bg-muted/50">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-muted rounded">
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
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button variant="ghost" size="sm" onClick={() => handleView(document)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(document)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => handleDownload(document)}>
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                            {document.approval_status === 'pending' && (
                                                                <>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleApprove(document.id)}
                                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleReject(document.id)}
                                                                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(document.id)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                    )}
                </TabsContent>

                <TabsContent value="pending-approval" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                                Documents Pending Approval
                            </CardTitle>
                            <CardDescription>
                                Review and approve or reject employee-uploaded documents
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {documents.filter(d => d.approval_status === 'pending').map((document) => {
                                    const IconComponent = getIconComponent(document.file_type);
                                    return (
                                        <Card key={document.id} className="border-l-4 border-l-yellow-500">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-4 flex-1">
                                                        <div className="p-3 bg-yellow-100 rounded-lg">
                                                            <IconComponent className="h-6 w-6 text-yellow-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-lg">{document.title}</h3>
                                                            <p className="text-sm text-muted-foreground mt-1">{document.description}</p>
                                                            <div className="flex flex-wrap gap-2 mt-3">
                                                                <Badge variant="outline">
                                                                    {DOCUMENT_CATEGORIES[document.category]?.name}
                                                                </Badge>
                                                                {document.subcategory && (
                                                                    <Badge variant="secondary">{document.subcategory}</Badge>
                                                                )}
                                                                <Badge variant="outline">
                                                                    {document.employee_name} ({document.employee_id})
                                                                </Badge>
                                                                <Badge variant="outline">
                                                                    {formatFileSize(document.file_size)}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-2">
                                                                Uploaded on {formatDate(document.uploaded_date)} by {document.uploaded_by_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleView(document)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            onClick={() => handleApprove(document.id)}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            <Check className="h-4 w-4 mr-2" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleReject(document.id)}
                                                        >
                                                            <X className="h-4 w-4 mr-2" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                                {documents.filter(d => d.approval_status === 'pending').length === 0 && (
                                    <div className="text-center py-12">
                                        <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold">All Caught Up!</h3>
                                        <p className="text-muted-foreground">No documents pending approval</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="by-category" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(DOCUMENT_CATEGORIES).map(([key, category]) => (
                            <Card key={key} className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="text-lg">{category.name}</span>
                                        <Badge variant="secondary" className="text-lg">
                                            {stats.byCategory[key] || 0}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>{category.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Subcategories:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {category.subcategories.map((sub) => (
                                                <Badge key={sub} variant="outline" className="text-xs">
                                                    {sub}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="by-employee" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents by Employee</CardTitle>
                            <CardDescription>View all documents organized by employee</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {employees.map((employee) => {
                                    const employeeDocs = documents.filter(d => d.employee_id === employee.employee_id);
                                    return (
                                        <Card key={employee.id} className="border-l-4 border-l-blue-500">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">
                                                            {employee.first_name} {employee.last_name}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {employee.employee_id} • {employee.department} • {employee.position}
                                                        </p>
                                                    </div>
                                                    <Badge variant="secondary" className="text-lg">
                                                        {employeeDocs.length} docs
                                                    </Badge>
                                                </div>
                                                {employeeDocs.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {employeeDocs.map((doc) => (
                                                            <Badge key={doc.id} variant="outline" className="text-xs">
                                                                {doc.subcategory || doc.title}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
