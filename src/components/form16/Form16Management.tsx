import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Send, 
  Edit, 
  Eye,
  Calendar,
  Users
} from "lucide-react";
import { Form16Data, Form16CreateRequest } from "@/types/form16";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [formData, setFormData] = useState<Partial<Form16CreateRequest>>({
    assessment_year: "2024-25",
    financial_year: "2023-24",
    salary_details: {
      basic_salary: 0,
      hra: 0,
      special_allowance: 0,
      other_allowances: 0,
    },
    deductions: {
      pf_employee: 0,
      pf_employer: 0,
      esi_employee: 0,
      esi_employer: 0,
      professional_tax: 0,
      other_deductions: 0,
    },
    tax_details: {
      exemptions_claimed: 0,
      standard_deduction: 50000,
      previous_employer_details: "",
    },
  });

  // Mock data for demonstration
  const mockForm16Data: Form16Data[] = [
    {
      id: "1",
      employee_id: "EMP001",
      employee_name: "John Doe",
      employee_email: "john.doe@company.com",
      pan_number: "ABCDE1234F",
      assessment_year: "2024-25",
      financial_year: "2023-24",
      employer_name: "Tech Solutions Pvt Ltd",
      employer_address: "123 Business Park, Tech City",
      employer_tan: "ABCD12345E",
      basic_salary: 600000,
      hra: 240000,
      special_allowance: 120000,
      other_allowances: 40000,
      gross_salary: 1000000,
      pf_employee: 21600,
      pf_employer: 21600,
      esi_employee: 0,
      esi_employer: 0,
      professional_tax: 2400,
      other_deductions: 0,
      total_deductions: 24000,
      taxable_income: 926000,
      income_tax: 112500,
      education_cess: 4500,
      total_tax: 117000,
      tds_deducted: 117000,
      exemptions_claimed: 0,
      standard_deduction: 50000,
      status: "issued",
      generated_date: "2024-03-15T10:00:00Z",
      issued_date: "2024-03-16T10:00:00Z",
      created_at: "2024-03-10T10:00:00Z",
      updated_at: "2024-03-16T10:00:00Z",
    },
    {
      id: "2",
      employee_id: "EMP002",
      employee_name: "Jane Smith",
      employee_email: "jane.smith@company.com",
      pan_number: "FGHIJ5678K",
      assessment_year: "2024-25",
      financial_year: "2023-24",
      employer_name: "Tech Solutions Pvt Ltd",
      employer_address: "123 Business Park, Tech City",
      employer_tan: "ABCD12345E",
      basic_salary: 800000,
      hra: 320000,
      special_allowance: 160000,
      other_allowances: 20000,
      gross_salary: 1300000,
      pf_employee: 21600,
      pf_employer: 21600,
      esi_employee: 0,
      esi_employer: 0,
      professional_tax: 2400,
      other_deductions: 5000,
      total_deductions: 29000,
      taxable_income: 1221000,
      income_tax: 187500,
      education_cess: 7500,
      total_tax: 195000,
      tds_deducted: 195000,
      exemptions_claimed: 0,
      standard_deduction: 50000,
      status: "generated",
      generated_date: "2024-03-15T10:00:00Z",
      created_at: "2024-03-10T10:00:00Z",
      updated_at: "2024-03-15T10:00:00Z",
    },
  ];

  const filteredData = mockForm16Data.filter((item) => {
    const matchesSearch = 
      item.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employee_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    const matchesYear = filterYear === "all" || item.assessment_year === filterYear;
    
    return matchesSearch && matchesStatus && matchesYear;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: Form16Data['status']) => {
    switch (status) {
      case 'issued':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'generated':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCreateForm16 = () => {
    // Mock creation logic
    console.log("Creating Form 16 with data:", { ...formData, employee_id: selectedEmployee });
    setIsCreateDialogOpen(false);
    setSelectedEmployee("");
    setFormData({
      assessment_year: "2024-25",
      financial_year: "2023-24",
      salary_details: {
        basic_salary: 0,
        hra: 0,
        special_allowance: 0,
        other_allowances: 0,
      },
      deductions: {
        pf_employee: 0,
        pf_employer: 0,
        esi_employee: 0,
        esi_employer: 0,
        professional_tax: 0,
        other_deductions: 0,
      },
      tax_details: {
        exemptions_claimed: 0,
        standard_deduction: 50000,
        previous_employer_details: "",
      },
    });
  };

  const handleIssueForm16 = (id: string) => {
    console.log("Issuing Form 16 with ID:", id);
  };

  const handleDownloadForm16 = (id: string) => {
    console.log("Downloading Form 16 with ID:", id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Form 16 Management</h1>
          <p className="text-muted-foreground">
            Generate and manage tax certificates for employees
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Generate Form 16
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generate New Form 16</DialogTitle>
              <DialogDescription>
                Create a new Form 16 certificate for an employee
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Employee Selection */}
              <div className="space-y-2">
                <Label htmlFor="employee">Select Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.employee_id}>
                        {employee.first_name} {employee.last_name} ({employee.employee_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assessment_year">Assessment Year</Label>
                  <Select 
                    value={formData.assessment_year} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assessment_year: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-25">2024-25</SelectItem>
                      <SelectItem value="2023-24">2023-24</SelectItem>
                      <SelectItem value="2022-23">2022-23</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="financial_year">Financial Year</Label>
                  <Select 
                    value={formData.financial_year} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, financial_year: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023-24">2023-24</SelectItem>
                      <SelectItem value="2022-23">2022-23</SelectItem>
                      <SelectItem value="2021-22">2021-22</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Salary Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Salary Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basic_salary">Basic Salary</Label>
                    <Input
                      id="basic_salary"
                      type="number"
                      value={formData.salary_details?.basic_salary || 0}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        salary_details: {
                          ...prev.salary_details!,
                          basic_salary: Number(e.target.value)
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hra">House Rent Allowance</Label>
                    <Input
                      id="hra"
                      type="number"
                      value={formData.salary_details?.hra || 0}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        salary_details: {
                          ...prev.salary_details!,
                          hra: Number(e.target.value)
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="special_allowance">Special Allowance</Label>
                    <Input
                      id="special_allowance"
                      type="number"
                      value={formData.salary_details?.special_allowance || 0}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        salary_details: {
                          ...prev.salary_details!,
                          special_allowance: Number(e.target.value)
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="other_allowances">Other Allowances</Label>
                    <Input
                      id="other_allowances"
                      type="number"
                      value={formData.salary_details?.other_allowances || 0}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        salary_details: {
                          ...prev.salary_details!,
                          other_allowances: Number(e.target.value)
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Deductions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pf_employee">PF (Employee)</Label>
                    <Input
                      id="pf_employee"
                      type="number"
                      value={formData.deductions?.pf_employee || 0}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        deductions: {
                          ...prev.deductions!,
                          pf_employee: Number(e.target.value)
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="professional_tax">Professional Tax</Label>
                    <Input
                      id="professional_tax"
                      type="number"
                      value={formData.deductions?.professional_tax || 0}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        deductions: {
                          ...prev.deductions!,
                          professional_tax: Number(e.target.value)
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateForm16} disabled={!selectedEmployee}>
                Generate Form 16
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
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">Total Forms</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">18</p>
                <p className="text-sm text-muted-foreground">Issued</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-sm text-muted-foreground">Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Draft</p>
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
                  placeholder="Search by employee name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="generated">Generated</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2024-25">2024-25</SelectItem>
                <SelectItem value="2023-24">2023-24</SelectItem>
                <SelectItem value="2022-23">2022-23</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Form 16 Table */}
      <Card>
        <CardHeader>
          <CardTitle>Form 16 Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Assessment Year</TableHead>
                <TableHead>Gross Salary</TableHead>
                <TableHead>Tax Deducted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((form16) => (
                <TableRow key={form16.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{form16.employee_name}</p>
                      <p className="text-sm text-muted-foreground">{form16.employee_id}</p>
                    </div>
                  </TableCell>
                  <TableCell>{form16.assessment_year}</TableCell>
                  <TableCell>{formatCurrency(form16.gross_salary)}</TableCell>
                  <TableCell>{formatCurrency(form16.tds_deducted)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(form16.status)}>
                      {form16.status.charAt(0).toUpperCase() + form16.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {form16.status === 'issued' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadForm16(form16.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {form16.status === 'generated' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleIssueForm16(form16.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
