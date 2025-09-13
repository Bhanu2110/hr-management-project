import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, Calendar, User, Building2, CreditCard, Clock } from "lucide-react";
import { SalarySlip, MONTHS } from "@/types/salary";

interface SalarySlipViewProps {
  salarySlip: SalarySlip;
  onDownload?: () => void;
}

export function SalarySlipView({ salarySlip, onDownload }: SalarySlipViewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: SalarySlip['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const monthName = MONTHS.find(m => m.value === salarySlip.month)?.label || 'Unknown';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Salary Slip</CardTitle>
                <p className="text-muted-foreground">
                  {monthName} {salarySlip.year} | Pay Period: {formatDate(salarySlip.pay_period_start)} - {formatDate(salarySlip.pay_period_end)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(salarySlip.status)}>
                {salarySlip.status.charAt(0).toUpperCase() + salarySlip.status.slice(1)}
              </Badge>
              {onDownload && salarySlip.status === 'paid' && (
                <Button onClick={onDownload} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Employee & Company Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Employee Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="font-medium">{salarySlip.employee_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
              <p className="font-medium">{salarySlip.employee_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-medium">{salarySlip.employee_email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Department</p>
              <p className="font-medium">{salarySlip.department}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Position</p>
              <p className="font-medium">{salarySlip.position}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Attendance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Working Days</p>
              <p className="font-medium">{salarySlip.working_days} days</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Present Days</p>
              <p className="font-medium">{salarySlip.present_days} days</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overtime Hours</p>
              <p className="font-medium">{salarySlip.overtime_hours} hours</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overtime Rate</p>
              <p className="font-medium">{formatCurrency(salarySlip.overtime_rate)}/hour</p>
            </div>
            {salarySlip.paid_date && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paid Date</p>
                <p className="font-medium">{formatDate(salarySlip.paid_date)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Earnings & Deductions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Salary Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Earnings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-green-700">Earnings</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Basic Salary</span>
                  <span className="font-medium">{formatCurrency(salarySlip.basic_salary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>House Rent Allowance</span>
                  <span className="font-medium">{formatCurrency(salarySlip.hra)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transport Allowance</span>
                  <span className="font-medium">{formatCurrency(salarySlip.transport_allowance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Medical Allowance</span>
                  <span className="font-medium">{formatCurrency(salarySlip.medical_allowance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Special Allowance</span>
                  <span className="font-medium">{formatCurrency(salarySlip.special_allowance)}</span>
                </div>
                {salarySlip.performance_bonus > 0 && (
                  <div className="flex justify-between">
                    <span>Performance Bonus</span>
                    <span className="font-medium">{formatCurrency(salarySlip.performance_bonus)}</span>
                  </div>
                )}
                {salarySlip.overtime_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Overtime Payment</span>
                    <span className="font-medium">{formatCurrency(salarySlip.overtime_amount)}</span>
                  </div>
                )}
                {salarySlip.other_allowances > 0 && (
                  <div className="flex justify-between">
                    <span>Other Allowances</span>
                    <span className="font-medium">{formatCurrency(salarySlip.other_allowances)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg text-green-700">
                  <span>Gross Earnings</span>
                  <span>{formatCurrency(salarySlip.gross_earnings)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-red-700">Deductions</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Provident Fund (Employee)</span>
                  <span className="font-medium">{formatCurrency(salarySlip.pf_employee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ESI (Employee)</span>
                  <span className="font-medium">{formatCurrency(salarySlip.esi_employee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Professional Tax</span>
                  <span className="font-medium">{formatCurrency(salarySlip.professional_tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Income Tax (TDS)</span>
                  <span className="font-medium">{formatCurrency(salarySlip.income_tax)}</span>
                </div>
                {salarySlip.loan_deduction > 0 && (
                  <div className="flex justify-between">
                    <span>Loan Deduction</span>
                    <span className="font-medium">{formatCurrency(salarySlip.loan_deduction)}</span>
                  </div>
                )}
                {salarySlip.advance_deduction > 0 && (
                  <div className="flex justify-between">
                    <span>Advance Deduction</span>
                    <span className="font-medium">{formatCurrency(salarySlip.advance_deduction)}</span>
                  </div>
                )}
                {salarySlip.late_deduction > 0 && (
                  <div className="flex justify-between">
                    <span>Late/Absence Deduction</span>
                    <span className="font-medium">{formatCurrency(salarySlip.late_deduction)}</span>
                  </div>
                )}
                {salarySlip.other_deductions > 0 && (
                  <div className="flex justify-between">
                    <span>Other Deductions</span>
                    <span className="font-medium">{formatCurrency(salarySlip.other_deductions)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg text-red-700">
                  <span>Total Deductions</span>
                  <span>{formatCurrency(salarySlip.total_deductions)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary */}
          <div className="mt-8 p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-primary">Net Salary</h3>
                <p className="text-sm text-muted-foreground">
                  Gross Earnings - Total Deductions
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(salarySlip.net_salary)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Contributions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Employer Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Provident Fund (Employer)</span>
                <span className="font-medium">{formatCurrency(salarySlip.pf_employer)}</span>
              </div>
              <div className="flex justify-between">
                <span>ESI (Employer)</span>
                <span className="font-medium">{formatCurrency(salarySlip.esi_employer)}</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>These contributions are made by your employer on your behalf and are not deducted from your salary.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>This is a computer-generated salary slip and does not require a signature.</p>
            <p className="mt-2">
              Generated on: {formatDate(salarySlip.generated_date)}
            </p>
            {salarySlip.paid_date && (
              <p>Salary paid on: {formatDate(salarySlip.paid_date)}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
