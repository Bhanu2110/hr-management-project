import React, { useState } from "react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Download, 
  Send, 
  Edit, 
  Eye,
  Calendar,
  Users,
  TrendingUp,
  Calculator,
  FileSpreadsheet
} from "lucide-react";
import { MONTHS, PAYROLL_STATUS_COLORS, PayrollEntry, EmployeePayrollCreateRequest } from "../types/payroll";
import { AppLayout } from "@/components/layout/AppLayout";

interface PayrollProps {
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

export default function Payroll({ employees = [] }: PayrollProps) {
  const [activeTab, setActiveTab] = useState("payroll-history");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("2024");
  const [isGeneratePayrollDialogOpen, setIsGeneratePayrollDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [formData, setFormData] = useState<Partial<EmployeePayrollCreateRequest>>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basic_salary: 0,
    hra: 0,
    transport_allowance: 0,
    medical_allowance: 0,
    special_allowance: 0,
    performance_bonus: 0,
    overtime_hours: 0,
    overtime_rate: 0,
    other_allowances: 0,
    pf_employee: 0,
    esi_employee: 0,
    professional_tax: 0,
    income_tax: 0,
    loan_deduction: 0,
    advance_deduction: 0,
    late_deduction: 0,
    other_deductions: 0,
    paid_date: undefined,
  });

  // Mock payroll data
  const mockPayrollEntries: PayrollEntry[] = [
    {
      id: "pay001",
      employee_id: "EMP001",
      employee_name: "John Doe",
      employee_email: "john.doe@example.com",
      month: 10,
      year: 2024,
      basic_salary: 50000,
      hra: 20000,
      transport_allowance: 2000,
      medical_allowance: 1500,
      special_allowance: 10000,
      performance_bonus: 5000,
      overtime_amount: 4000,
      other_allowances: 1000,
      gross_earnings: 93500,
      pf_employee: 1800,
      esi_employee: 0,
      professional_tax: 200,
      income_tax: 8500,
      loan_deduction: 0,
      advance_deduction: 0,
      late_deduction: 0,
      other_deductions: 0,
      total_deductions: 10500,
      net_salary: 83000,
      status: "paid",
      paid_date: "2024-10-31T10:00:00Z",
      created_at: "2024-10-25T10:00:00Z",
    },
    {
      id: "pay002",
      employee_id: "EMP002",
      employee_name: "Jane Smith",
      employee_email: "jane.smith@example.com",
      month: 10,
      year: 2024,
      basic_salary: 60000,
      hra: 24000,
      transport_allowance: 2000,
      medical_allowance: 1500,
      special_allowance: 15000,
      performance_bonus: 8000,
      overtime_amount: 0,
      other_allowances: 2000,
      gross_earnings: 112500,
      pf_employee: 1800,
      esi_employee: 0,
      professional_tax: 200,
      income_tax: 12000,
      loan_deduction: 5000,
      advance_deduction: 0,
      late_deduction: 1000,
      other_deductions: 0,
      total_deductions: 20000,
      net_salary: 92500,
      status: "pending",
      paid_date: undefined,
      created_at: "2024-10-25T10:00:00Z",
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleGeneratePayroll = () => {
    console.log("Generating payroll with data:", { ...formData, employee_id: selectedEmployee });
    setIsGeneratePayrollDialogOpen(false);
    setSelectedEmployee("");
    setFormData({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      basic_salary: 0,
      hra: 0,
      transport_allowance: 0,
      medical_allowance: 0,
      special_allowance: 0,
      performance_bonus: 0,
      overtime_hours: 0,
      overtime_rate: 0,
      other_allowances: 0,
      pf_employee: 0,
      esi_employee: 0,
      professional_tax: 0,
      income_tax: 0,
      loan_deduction: 0,
      advance_deduction: 0,
      late_deduction: 0,
      other_deductions: 0,
      paid_date: undefined,
    });
  };

  const handleMarkAsPaid = (id: string) => {
    console.log("Marking payroll as paid for ID:", id);
  };

  const filteredPayrollEntries = mockPayrollEntries.filter((entry) => {
    const matchesSearch = 
      entry.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || entry.status === filterStatus;
    const matchesMonth = filterMonth === "all" || entry.month.toString() === filterMonth;
    const matchesYear = entry.year.toString() === filterYear;
    
    return matchesSearch && matchesStatus && matchesMonth && matchesYear;
  });

  const totalPayout = filteredPayrollEntries.reduce((sum, entry) => sum + entry.net_salary, 0);
  const totalEmployeesPaid = filteredPayrollEntries.filter(entry => entry.status === "paid").length;
  const totalPendingPayout = filteredPayrollEntries.filter(entry => entry.status === "pending").reduce((sum, entry) => sum + entry.net_salary, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex items-center justify-end">
          <div className="flex gap-2">
            <Button variant="default" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export Payroll Report
            </Button>
            <Dialog open={isGeneratePayrollDialogOpen} onOpenChange={setIsGeneratePayrollDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Generate Payroll
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Generate Employee Payroll</DialogTitle>
                  <DialogDescription>
                    Create a new payroll entry for an employee
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="month">Month</Label>
                      <Select 
                        value={formData.month?.toString()} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, month: Number(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((month) => (
                            <SelectItem key={month.value} value={month.value.toString()}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year || new Date().getFullYear()}
                        onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="basic_salary">Basic Salary</Label>
                      <Input
                        id="basic_salary"
                        type="number"
                        value={formData.basic_salary || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, basic_salary: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hra">HRA</Label>
                      <Input
                        id="hra"
                        type="number"
                        value={formData.hra || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, hra: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="transport_allowance">Transport Allowance</Label>
                      <Input
                        id="transport_allowance"
                        type="number"
                        value={formData.transport_allowance || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, transport_allowance: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medical_allowance">Medical Allowance</Label>
                      <Input
                        id="medical_allowance"
                        type="number"
                        value={formData.medical_allowance || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, medical_allowance: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="special_allowance">Special Allowance</Label>
                      <Input
                        id="special_allowance"
                        type="number"
                        value={formData.special_allowance || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, special_allowance: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="performance_bonus">Performance Bonus</Label>
                      <Input
                        id="performance_bonus"
                        type="number"
                        value={formData.performance_bonus || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, performance_bonus: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="overtime_hours">Overtime Hours</Label>
                      <Input
                        id="overtime_hours"
                        type="number"
                        value={formData.overtime_hours || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, overtime_hours: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="overtime_rate">Overtime Rate</Label>
                      <Input
                        id="overtime_rate"
                        type="number"
                        value={formData.overtime_rate || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, overtime_rate: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="other_allowances">Other Allowances</Label>
                      <Input
                        id="other_allowances"
                        type="number"
                        value={formData.other_allowances || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, other_allowances: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loan_deduction">Loan Deduction</Label>
                      <Input
                        id="loan_deduction"
                        type="number"
                        value={formData.loan_deduction || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, loan_deduction: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="advance_deduction">Advance Deduction</Label>
                      <Input
                        id="advance_deduction"
                        type="number"
                        value={formData.advance_deduction || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, advance_deduction: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="late_deduction">Late Deduction</Label>
                      <Input
                        id="late_deduction"
                        type="number"
                        value={formData.late_deduction || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, late_deduction: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="other_deductions">Other Deductions</Label>
                      <Input
                        id="other_deductions"
                        type="number"
                        value={formData.other_deductions || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, other_deductions: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="income_tax">Income Tax</Label>
                      <Input
                        id="income_tax"
                        type="number"
                        value={formData.income_tax || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, income_tax: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pf_employee">PF (Employee)</Label>
                      <Input
                        id="pf_employee"
                        type="number"
                        value={formData.pf_employee || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, pf_employee: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="esi_employee">ESI (Employee)</Label>
                      <Input
                        id="esi_employee"
                        type="number"
                        value={formData.esi_employee || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, esi_employee: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="professional_tax">Professional Tax</Label>
                    <Input
                      id="professional_tax"
                      type="number"
                      value={formData.professional_tax || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, professional_tax: Number(e.target.value) }))}
                    />
                  </div>

                  <Separator />
                  <h3 className="text-lg font-semibold">Payment Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paid_date">Payment Date</Label>
                      <Input
                        id="paid_date"
                        type="date"
                        value={formData.paid_date ? new Date(formData.paid_date).toISOString().split('T')[0] : ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, paid_date: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsGeneratePayrollDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleGeneratePayroll} disabled={!selectedEmployee}>
                    Generate Payroll
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalPayout)}</p>
                  <p className="text-sm text-muted-foreground">Total Payout</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{totalEmployeesPaid}</p>
                  <p className="text-sm text-muted-foreground">Employees Paid</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalPendingPayout)}</p>
                  <p className="text-sm text-muted-foreground">Pending Payout</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="payroll-history">Payroll History</TabsTrigger>
            <TabsTrigger value="payroll-summary">Payroll Summary</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by employee name or ID..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <TabsContent value="payroll-history">
            <Card>
              <CardHeader>
                <CardTitle>Payroll History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Month/Year</TableHead>
                      <TableHead>Gross Earnings</TableHead>
                      <TableHead>Total Deductions</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Paid Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayrollEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{entry.employee_name}</p>
                            <p className="text-sm text-muted-foreground">{entry.employee_id}</p>
                          </div>
                        </TableCell>
                        <TableCell>{MONTHS.find(m => m.value === entry.month)?.label} {entry.year}</TableCell>
                        <TableCell>{formatCurrency(entry.gross_earnings)}</TableCell>
                        <TableCell>{formatCurrency(entry.total_deductions)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(entry.net_salary)}</TableCell>
                        <TableCell>
                          <Badge className={PAYROLL_STATUS_COLORS[entry.status]}>
                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {entry.paid_date ? new Date(entry.paid_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {entry.status === 'pending' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleMarkAsPaid(entry.id)}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            {(entry.status === 'paid' || entry.status === 'processed') && (
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
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
          </TabsContent>

          <TabsContent value="payroll-summary">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This section will display a summary of payroll data.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
