import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Plus,
  Search,
  FileText,
  Download,
  Trash2,
  Upload,
  Calendar,
  Users,
  Loader2,
  Edit,
  RotateCcw,
  ArrowUpDown
} from "lucide-react";

type Form16SortField = 'employee' | 'file_name' | 'financial_year' | 'quarter' | 'file_size' | 'uploaded_at';
type SortDirection = 'asc' | 'desc';
import {
  fetchAllForm16Documents,
  uploadForm16Document,
  updateForm16Document,
  deleteForm16Document,
  downloadForm16Document,
  getForm16Statistics,
  Form16Document
} from "@/api/form16";
import { useToast } from "@/hooks/use-toast";

interface Form16ManagementProps {
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

export function Form16Management({ employees = [] }: Form16ManagementProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [financialYear, setFinancialYear] = useState("2024-25");
  const [quarter, setQuarter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Form16Document | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [form16Documents, setForm16Documents] = useState<Form16Document[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    employees: 0,
    years: [] as string[],
  });

  // Sorting states
  const [sortField, setSortField] = useState<Form16SortField>('uploaded_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Fetch Form 16 documents on mount
  useEffect(() => {
    loadForm16Documents();
    loadStatistics();
  }, []);

  const loadForm16Documents = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllForm16Documents();
      setForm16Documents(data);
    } catch (error) {
      console.error('Error loading Form 16 documents:', error);
      toast({
        title: "Error",
        description: "Failed to load Form 16 documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const statistics = await getForm16Statistics();
      setStats(statistics);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  // Generate month options
  const months = [
    { value: "all", label: "All Months" },
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Generate year options (last 5 years to next year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => (currentYear - 5 + i).toString());

  const filteredData = form16Documents.filter((item) => {
    const employee = employees.find(e => e.id === item.employee_id);
    const employeeName = employee ? `${employee.first_name} ${employee.last_name}` : '';

    const matchesSearch =
      employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.financial_year.toLowerCase().includes(searchTerm.toLowerCase());

    // Date filtering based on upload date
    let matchesDate = true;
    if (selectedMonth !== "all") {
      const docDate = new Date(item.uploaded_at);
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth) - 1; // JavaScript months are 0-indexed
      matchesDate = 
        docDate.getFullYear() === year &&
        docDate.getMonth() === month;
    }

    return matchesSearch && matchesDate;
  });

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown';
  };

  const handleSort = (field: Form16SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'employee':
          const nameA = getEmployeeName(a.employee_id);
          const nameB = getEmployeeName(b.employee_id);
          comparison = nameA.localeCompare(nameB);
          break;
        case 'file_name':
          comparison = a.file_name.localeCompare(b.file_name);
          break;
        case 'financial_year':
          comparison = a.financial_year.localeCompare(b.financial_year);
          break;
        case 'quarter':
          const quarterA = a.quarter || '';
          const quarterB = b.quarter || '';
          comparison = quarterA.localeCompare(quarterB);
          break;
        case 'file_size':
          comparison = (a.file_size || 0) - (b.file_size || 0);
          break;
        case 'uploaded_at':
          comparison = new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortField, sortDirection, employees]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or DOCX file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUploadForm16 = async () => {
    if (!selectedEmployee || !selectedFile) {
      toast({
        title: "Error",
        description: "Please select an employee and a file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      await uploadForm16Document({
        employee_id: selectedEmployee,
        file: selectedFile,
        financial_year: financialYear,
        quarter: quarter || undefined,
      });

      toast({
        title: "Success",
        description: "Form 16 uploaded successfully",
      });

      setIsUploadDialogOpen(false);
      resetForm();

      // Reload data
      await loadForm16Documents();
      await loadStatistics();
    } catch (error) {
      console.error('Error uploading Form 16:', error);
      toast({
        title: "Error",
        description: "Failed to upload Form 16",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedEmployee("");
    setSelectedFile(null);
    setFinancialYear("2024-25");
    setQuarter("");
  };

  const handleEditForm16 = (doc: Form16Document) => {
    setEditingDocument(doc);
    setFinancialYear(doc.financial_year);
    setQuarter(doc.quarter || "");
    setEditFile(null); // Reset file selection
    setIsEditDialogOpen(true);
  };

  const handleEditFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or DOCX file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }

      setEditFile(file);
    }
  };

  const handleUpdateForm16 = async () => {
    if (!editingDocument) return;

    try {
      setIsUpdating(true);
      await updateForm16Document(editingDocument.id, {
        financial_year: financialYear,
        quarter: quarter || null,
        file: editFile || undefined,
        employee_id: editingDocument.employee_id,
      });

      toast({
        title: "Success",
        description: editFile
          ? "Form 16 document and metadata updated successfully"
          : "Form 16 metadata updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingDocument(null);
      setEditFile(null);
      resetForm();

      // Reload data
      await loadForm16Documents();
      await loadStatistics();
    } catch (error) {
      console.error('Error updating Form 16:', error);
      toast({
        title: "Error",
        description: "Failed to update Form 16",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteForm16 = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Form 16?")) {
      return;
    }

    try {
      await deleteForm16Document(id);
      toast({
        title: "Success",
        description: "Form 16 deleted successfully",
      });

      // Reload data
      await loadForm16Documents();
      await loadStatistics();
    } catch (error) {
      console.error('Error deleting Form 16:', error);
      toast({
        title: "Error",
        description: "Failed to delete Form 16",
        variant: "destructive",
      });
    }
  };

  const handleDownloadForm16 = async (id: string) => {
    try {
      await downloadForm16Document(id);
    } catch (error) {
      console.error('Error downloading Form 16:', error);
      toast({
        title: "Error",
        description: "Failed to download Form 16",
        variant: "destructive",
      });
    }
  };


  const getEmployeeDetails = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.employee_id} - ${employee.department}` : '';
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Form 16 Management</h1>
          <p className="text-muted-foreground">
            Upload and manage Form 16 tax certificates for employees
          </p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Form 16
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Form 16</DialogTitle>
              <DialogDescription>
                Upload a Form 16 certificate for an employee
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Employee Selection */}
              <div className="space-y-2">
                <Label htmlFor="employee">Select Employee</Label>
                <Combobox
                  options={employees.map((employee) => ({
                    value: employee.id,
                    label: `${employee.first_name} ${employee.last_name} (${employee.employee_id})`
                  }))}
                  value={selectedEmployee}
                  onValueChange={setSelectedEmployee}
                  placeholder="Choose an employee"
                  searchPlaceholder="Search employees..."
                  emptyText="No employees found."
                />
              </div>

              {/* Financial Year */}
              <div className="space-y-2">
                <Label htmlFor="financial_year">Financial Year</Label>
                <Select value={financialYear} onValueChange={setFinancialYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-25">2024-25</SelectItem>
                    <SelectItem value="2023-24">2023-24</SelectItem>
                    <SelectItem value="2022-23">2022-23</SelectItem>
                    <SelectItem value="2021-22">2021-22</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quarter (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="quarter">Quarter (Optional)</Label>
                <Select value={quarter} onValueChange={setQuarter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quarter (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">Q1 (Apr-Jun)</SelectItem>
                    <SelectItem value="Q2">Q2 (Jul-Sep)</SelectItem>
                    <SelectItem value="Q3">Q3 (Oct-Dec)</SelectItem>
                    <SelectItem value="Q4">Q4 (Jan-Mar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file">Form 16 Document</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Accepted formats: PDF, DOCX (Max 10MB)
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUploadForm16} disabled={!selectedEmployee || !selectedFile || isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload
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
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.employees}</p>
                <p className="text-sm text-muted-foreground">Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.years.length}</p>
                <p className="text-sm text-muted-foreground">Financial Years</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{filteredData.length}</p>
                <p className="text-sm text-muted-foreground">Filtered Results</p>
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
                  placeholder="Search by employee name or file name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSelectedMonth("all");
                  setSelectedYear(new Date().getFullYear().toString());
                }}
                title="Reset Filter"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form 16 Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Form 16 Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No Form 16 documents found
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[60px]">S.No</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/70"
                    onClick={() => handleSort('employee')}
                  >
                    <div className="flex items-center gap-1">
                      Employee
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/70"
                    onClick={() => handleSort('file_name')}
                  >
                    <div className="flex items-center gap-1">
                      File Name
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/70"
                    onClick={() => handleSort('financial_year')}
                  >
                    <div className="flex items-center gap-1">
                      Financial Year
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/70"
                    onClick={() => handleSort('quarter')}
                  >
                    <div className="flex items-center gap-1">
                      Quarter
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/70"
                    onClick={() => handleSort('file_size')}
                  >
                    <div className="flex items-center gap-1">
                      File Size
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/70"
                    onClick={() => handleSort('uploaded_at')}
                  >
                    <div className="flex items-center gap-1">
                      Uploaded Date
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((doc, index) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{getEmployeeName(doc.employee_id)}</p>
                        <p className="text-sm text-muted-foreground">{getEmployeeDetails(doc.employee_id)}</p>
                      </div>
                    </TableCell>
                    <TableCell>{doc.file_name}</TableCell>
                    <TableCell>{doc.financial_year}</TableCell>
                    <TableCell>{doc.quarter || '-'}</TableCell>
                    <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                    <TableCell>{formatDate(doc.uploaded_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditForm16(doc)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadForm16(doc.id)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteForm16(doc.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Form 16 Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Form 16</DialogTitle>
            <DialogDescription>
              Update the financial year and quarter for this Form 16 document
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Display Employee Info */}
            {editingDocument && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">
                  Employee: {getEmployeeName(editingDocument.employee_id)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getEmployeeDetails(editingDocument.employee_id)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  File: {editingDocument.file_name}
                </p>
              </div>
            )}

            {/* Financial Year */}
            <div className="space-y-2">
              <Label htmlFor="edit_financial_year">Financial Year</Label>
              <Select value={financialYear} onValueChange={setFinancialYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-25">2024-25</SelectItem>
                  <SelectItem value="2023-24">2023-24</SelectItem>
                  <SelectItem value="2022-23">2022-23</SelectItem>
                  <SelectItem value="2021-22">2021-22</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quarter (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="edit_quarter">Quarter (Optional)</Label>
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quarter (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1">Q1 (Apr-Jun)</SelectItem>
                  <SelectItem value="Q2">Q2 (Jul-Sep)</SelectItem>
                  <SelectItem value="Q3">Q3 (Oct-Dec)</SelectItem>
                  <SelectItem value="Q4">Q4 (Jan-Mar)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Upload (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="edit_file">Replace Document (Optional)</Label>
              <Input
                id="edit_file"
                type="file"
                accept=".pdf,.docx"
                onChange={handleEditFileSelect}
              />
              {editFile && (
                <p className="text-sm text-muted-foreground">
                  New file: {editFile.name} ({formatFileSize(editFile.size)})
                </p>
              )}
              {!editFile && editingDocument && (
                <p className="text-xs text-muted-foreground">
                  Current file: {editingDocument.file_name}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Leave empty to keep the current file. Accepted formats: PDF, DOCX (Max 10MB)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingDocument(null);
                setEditFile(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateForm16} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
