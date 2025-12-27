import React, { useState } from 'react';
import { 
  Download, 
  Eye, 
  Edit2, 
  CheckCircle2, 
  XCircle, 
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from "@/components/ui/combobox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import EmployeeSalarySlip from './EmployeeSalarySlip';

interface Employee {
  id: string;
  name: string;
  department: string;
  designation: string;
  status: 'pending' | 'approved' | 'rejected';
  netSalary: number;
}

const AdminSalaryDashboard: React.FC = () => {
  // State for filters and controls
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [department, setDepartment] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [isViewingSlip, setIsViewingSlip] = useState<boolean>(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(true);

  // Sample data - in a real app, this would come from an API
  const employees: Employee[] = [
    { 
      id: 'EMP001', 
      name: 'John Doe', 
      department: 'Engineering', 
      designation: 'Software Engineer', 
      status: 'approved', 
      netSalary: 79500 
    },
    { 
      id: 'EMP002', 
      name: 'Jane Smith', 
      department: 'HR', 
      designation: 'HR Manager', 
      status: 'pending', 
      netSalary: 85000 
    },
    { 
      id: 'EMP003', 
      name: 'Bob Johnson', 
      department: 'Marketing', 
      designation: 'Marketing Head', 
      status: 'approved', 
      netSalary: 92000 
    },
    { 
      id: 'EMP004', 
      name: 'Alice Brown', 
      department: 'Engineering', 
      designation: 'Senior Developer', 
      status: 'rejected', 
      netSalary: 110000 
    },
    { 
      id: 'EMP005', 
      name: 'Mike Wilson', 
      department: 'Finance', 
      designation: 'Financial Analyst', 
      status: 'approved', 
      netSalary: 88000 
    },
    { 
      id: 'EMP006', 
      name: 'Sarah Davis', 
      department: 'HR', 
      designation: 'Recruiter', 
      status: 'pending', 
      netSalary: 75000 
    },
  ];
  
  // Sort employees by name for better readability
  const sortedEmployees = [...employees].sort((a, b) => a.name.localeCompare(b.name));

  const departments = ['All', 'Engineering', 'HR', 'Marketing', 'Finance'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const statusVariants = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const handleViewSlip = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      setSelectedEmployee(employeeId);
      setIsViewingSlip(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToList = () => {
    setIsViewingSlip(false);
    setSelectedEmployee(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApprove = (employeeId: string) => {
    // Implement approve logic
    console.log(`Approved salary for employee ${employeeId}`);
  };

  const handleReject = (employeeId: string) => {
    // Implement reject logic
    console.log(`Rejected salary for employee ${employeeId}`);
  };

  const handleGenerateSlip = () => {
    // Implement generate slip logic
    console.log('Generating new salary slip');
  };

  const handleBulkProcess = () => {
    // Implement bulk process logic
    console.log('Processing bulk salary');
  };

  if (isViewingSlip && selectedEmployee) {
    const employee = employees.find(emp => emp.id === selectedEmployee);
    if (!employee) return <div>Employee not found</div>;
    
    return (
      <div className="space-y-4">
        <Button 
          onClick={handleBackToList}
          variant="outline"
          className="mb-4"
        >
          ← Back to List
        </Button>
        <EmployeeSalarySlip isAdmin={true} employeeData={employee} />
      </div>
    );
  }

  // Filter employees based on department
  const filteredEmployees = department === 'all' 
    ? sortedEmployees 
    : sortedEmployees.filter(emp => 
        department === 'all' || 
        emp.department.toLowerCase() === department.toLowerCase()
      );
      
  // Get unique departments for the filter dropdown
  const uniqueDepartments = ['all', ...new Set(employees.map(emp => emp.department))];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Salary Slip Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <h3 className="font-medium">Filters</h3>
              {isFiltersOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
            
            {isFiltersOpen && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-3">
                  <Label htmlFor="month">Month</Label>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m} value={m.toLowerCase()}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="Year"
                  />
                </div>
                
                <div className="md:col-span-3">
                  <Label htmlFor="department">Department</Label>
                  <Combobox
                    options={uniqueDepartments.map((dept) => ({
                      value: dept.toLowerCase(),
                      label: dept === 'all' ? 'All Departments' : dept
                    }))}
                    value={department}
                    onValueChange={setDepartment}
                    placeholder="Select department"
                    searchPlaceholder="Search departments..."
                    emptyText="No departments found."
                  />
                </div>
                
                <div className="md:col-span-4 flex items-end gap-2">
                  <Button 
                    className="w-full"
                    onClick={handleGenerateSlip}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Generate New Slip
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleBulkProcess}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Bulk Process
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Employee Salary Slips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead className="text-right">Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {department === 'all' 
                          ? 'No employees found' 
                          : `No employees found in ${department} department`}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{employee.id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.designation}</TableCell>
                    <TableCell className="text-right">
                      ₹{employee.netSalary.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`${statusVariants[employee.status]} capitalize`}
                        variant="outline"
                      >
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleViewSlip(employee.id)}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View Slip</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Slip</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Edit2 className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-green-600 hover:text-green-700 hover:bg-green-100"
                                onClick={() => handleApprove(employee.id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="sr-only">Approve</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Approve</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-100"
                                onClick={() => handleReject(employee.id)}
                              >
                                <XCircle className="h-4 w-4" />
                                <span className="sr-only">Reject</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reject</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSalaryDashboard;
