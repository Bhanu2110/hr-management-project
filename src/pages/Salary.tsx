import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { SalaryManagement } from "@/components/salary/SalaryManagement";
import { SalarySlipView } from "@/components/salary/SalarySlipView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { FileText, Download, Calendar, AlertCircle, DollarSign, TrendingUp } from "lucide-react";
import { SalarySlip, MONTHS, SALARY_STATUS_COLORS } from "@/types/salary";

const Salary = () => {
  const { isAdmin, employee } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedSalarySlip, setSelectedSalarySlip] = useState<SalarySlip | null>(null);

  // Mock employee data for admin view
  const mockEmployees = [
    {
      id: "1",
      employee_id: "EMP001",
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@company.com",
      department: "Engineering",
      position: "Software Developer",
    },
    {
      id: "2",
      employee_id: "EMP002",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@company.com",
      department: "Marketing",
      position: "Marketing Manager",
    },
  ];

  // Mock salary slip data for employee view
  const mockEmployeeSalarySlips: SalarySlip[] = [
    {
      id: "1",
      employee_id: employee?.employee_id || "EMP001",
      employee_name: `${employee?.first_name || "John"} ${employee?.last_name || "Doe"}`,
      employee_email: employee?.email || "john.doe@company.com",
      department: employee?.department || "Engineering",
      position: employee?.position || "Software Developer",
      month: 11,
      year: 2024,
      pay_period_start: "2024-11-01T00:00:00Z",
      pay_period_end: "2024-11-30T23:59:59Z",
      working_days: 22,
      present_days: 22,
      basic_salary: 50000,
      hra: 20000,
      transport_allowance: 2000,
      medical_allowance: 1500,
      special_allowance: 10000,
      performance_bonus: 5000,
      overtime_hours: 8,
      overtime_rate: 500,
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
      pf_employer: 1800,
      esi_employer: 0,
      status: "paid",
      generated_date: "2024-11-25T10:00:00Z",
      paid_date: "2024-11-30T10:00:00Z",
      created_at: "2024-11-25T10:00:00Z",
      updated_at: "2024-11-30T10:00:00Z",
    },
    {
      id: "2",
      employee_id: employee?.employee_id || "EMP001",
      employee_name: `${employee?.first_name || "John"} ${employee?.last_name || "Doe"}`,
      employee_email: employee?.email || "john.doe@company.com",
      department: employee?.department || "Engineering",
      position: employee?.position || "Software Developer",
      month: 10,
      year: 2024,
      pay_period_start: "2024-10-01T00:00:00Z",
      pay_period_end: "2024-10-31T23:59:59Z",
      working_days: 23,
      present_days: 23,
      basic_salary: 50000,
      hra: 20000,
      transport_allowance: 2000,
      medical_allowance: 1500,
      special_allowance: 10000,
      performance_bonus: 3000,
      overtime_hours: 4,
      overtime_rate: 500,
      overtime_amount: 2000,
      other_allowances: 500,
      gross_earnings: 89000,
      pf_employee: 1800,
      esi_employee: 0,
      professional_tax: 200,
      income_tax: 8000,
      loan_deduction: 0,
      advance_deduction: 0,
      late_deduction: 0,
      other_deductions: 0,
      total_deductions: 10000,
      net_salary: 79000,
      pf_employer: 1800,
      esi_employer: 0,
      status: "paid",
      generated_date: "2024-10-25T10:00:00Z",
      paid_date: "2024-10-31T10:00:00Z",
      created_at: "2024-10-25T10:00:00Z",
      updated_at: "2024-10-31T10:00:00Z",
    },
    {
      id: "3",
      employee_id: employee?.employee_id || "EMP001",
      employee_name: `${employee?.first_name || "John"} ${employee?.last_name || "Doe"}`,
      employee_email: employee?.email || "john.doe@company.com",
      department: employee?.department || "Engineering",
      position: employee?.position || "Software Developer",
      month: 12,
      year: 2024,
      pay_period_start: "2024-12-01T00:00:00Z",
      pay_period_end: "2024-12-31T23:59:59Z",
      working_days: 21,
      present_days: 21,
      basic_salary: 50000,
      hra: 20000,
      transport_allowance: 2000,
      medical_allowance: 1500,
      special_allowance: 10000,
      performance_bonus: 0,
      overtime_hours: 0,
      overtime_rate: 500,
      overtime_amount: 0,
      other_allowances: 0,
      gross_earnings: 83500,
      pf_employee: 1800,
      esi_employee: 0,
      professional_tax: 200,
      income_tax: 7500,
      loan_deduction: 0,
      advance_deduction: 0,
      late_deduction: 0,
      other_deductions: 0,
      total_deductions: 9500,
      net_salary: 74000,
      pf_employer: 1800,
      esi_employer: 0,
      status: "processed",
      generated_date: "2024-12-01T10:00:00Z",
      created_at: "2024-12-01T10:00:00Z",
      updated_at: "2024-12-01T10:00:00Z",
    },
  ];

  const currentSalarySlip = mockEmployeeSalarySlips.find(
    slip => slip.month === Number(selectedMonth) && slip.year === Number(selectedYear)
  );

  const handleDownload = () => {
    console.log("Downloading salary slip PDF...");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate yearly totals for employee dashboard
  const yearlyTotals = mockEmployeeSalarySlips
    .filter(slip => slip.year === Number(selectedYear))
    .reduce(
      (acc, slip) => ({
        grossEarnings: acc.grossEarnings + slip.gross_earnings,
        totalDeductions: acc.totalDeductions + slip.total_deductions,
        netSalary: acc.netSalary + slip.net_salary,
      }),
      { grossEarnings: 0, totalDeductions: 0, netSalary: 0 }
    );

  if (isAdmin) {
    return (
      <AppLayout>
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Salary Management</h1>
              <p className="text-muted-foreground">
                Manage employee salaries, generate salary slips, and view payroll reports
              </p>
            </div>
          </div>
          <SalaryManagement employees={mockEmployees} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Employee Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Salary</h1>
            <p className="text-muted-foreground">
              View your salary slips and earnings history
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Yearly Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(yearlyTotals.grossEarnings)}</p>
                  <p className="text-sm text-muted-foreground">Total Gross ({selectedYear})</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(yearlyTotals.totalDeductions)}</p>
                  <p className="text-sm text-muted-foreground">Total Deductions ({selectedYear})</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(yearlyTotals.netSalary)}</p>
                  <p className="text-sm text-muted-foreground">Total Net ({selectedYear})</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Salary Slips Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Salary Slips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockEmployeeSalarySlips.slice(0, 6).map((slip) => (
                <Card key={slip.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-semibold">
                          {MONTHS.find(m => m.value === slip.month)?.label} {slip.year}
                        </span>
                      </div>
                      <Badge className={SALARY_STATUS_COLORS[slip.status]}>
                        {slip.status.charAt(0).toUpperCase() + slip.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gross:</span>
                        <span className="font-medium">{formatCurrency(slip.gross_earnings)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Net:</span>
                        <span className="font-medium text-green-600">{formatCurrency(slip.net_salary)}</span>
                      </div>
                    </div>
                    {slip.status === 'paid' && (
                      <Button 
                        className="w-full mt-3 gap-2" 
                        size="sm"
                        onClick={() => setSelectedSalarySlip(slip)}
                      >
                        <FileText className="h-4 w-4" />
                        View Slip
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Salary Slip Display */}
        {currentSalarySlip ? (
          <SalarySlipView 
            salarySlip={currentSalarySlip} 
            onDownload={handleDownload}
          />
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Salary Slip Available</h3>
              <p className="text-muted-foreground">
                Salary slip for {MONTHS.find(m => m.value === Number(selectedMonth))?.label} {selectedYear} is not yet available. 
                Please contact HR for more information.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Selected Salary Slip Modal */}
        {selectedSalarySlip && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg max-w-6xl max-h-[90vh] overflow-y-auto w-full">
              <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Salary Slip - {MONTHS.find(m => m.value === selectedSalarySlip.month)?.label} {selectedSalarySlip.year}
                </h2>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedSalarySlip(null)}
                >
                  Close
                </Button>
              </div>
              <div className="p-6">
                <SalarySlipView 
                  salarySlip={selectedSalarySlip} 
                  onDownload={handleDownload}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Salary;