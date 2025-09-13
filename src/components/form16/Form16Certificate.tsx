import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, Calendar, User, Building2, CreditCard } from "lucide-react";
import { Form16Data } from "@/types/form16";

interface Form16CertificateProps {
  form16Data: Form16Data;
  onDownload?: () => void;
}

export function Form16Certificate({ form16Data, onDownload }: Form16CertificateProps) {
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
                <CardTitle className="text-2xl">Form 16 - Tax Certificate</CardTitle>
                <p className="text-muted-foreground">
                  Assessment Year: {form16Data.assessment_year} | Financial Year: {form16Data.financial_year}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(form16Data.status)}>
                {form16Data.status.charAt(0).toUpperCase() + form16Data.status.slice(1)}
              </Badge>
              {onDownload && form16Data.status === 'issued' && (
                <Button onClick={onDownload} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Employee & Employer Details */}
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
              <p className="font-medium">{form16Data.employee_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
              <p className="font-medium">{form16Data.employee_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-medium">{form16Data.employee_email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">PAN Number</p>
              <p className="font-medium font-mono">{form16Data.pan_number}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Employer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Company Name</p>
              <p className="font-medium">{form16Data.employer_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p className="font-medium">{form16Data.employer_address}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">TAN Number</p>
              <p className="font-medium font-mono">{form16Data.employer_tan}</p>
            </div>
            {form16Data.issued_date && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                <p className="font-medium">{formatDate(form16Data.issued_date)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Salary Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Salary Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Income Components</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Basic Salary</span>
                  <span className="font-medium">{formatCurrency(form16Data.basic_salary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>House Rent Allowance</span>
                  <span className="font-medium">{formatCurrency(form16Data.hra)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Special Allowance</span>
                  <span className="font-medium">{formatCurrency(form16Data.special_allowance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Allowances</span>
                  <span className="font-medium">{formatCurrency(form16Data.other_allowances)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Gross Salary</span>
                  <span>{formatCurrency(form16Data.gross_salary)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Deductions</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>PF (Employee)</span>
                  <span className="font-medium">{formatCurrency(form16Data.pf_employee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ESI (Employee)</span>
                  <span className="font-medium">{formatCurrency(form16Data.esi_employee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Professional Tax</span>
                  <span className="font-medium">{formatCurrency(form16Data.professional_tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Deductions</span>
                  <span className="font-medium">{formatCurrency(form16Data.other_deductions)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Deductions</span>
                  <span>{formatCurrency(form16Data.total_deductions)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Computation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tax Computation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Taxable Income</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Gross Salary</span>
                  <span className="font-medium">{formatCurrency(form16Data.gross_salary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Less: Standard Deduction</span>
                  <span className="font-medium text-red-600">-{formatCurrency(form16Data.standard_deduction)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Less: Exemptions Claimed</span>
                  <span className="font-medium text-red-600">-{formatCurrency(form16Data.exemptions_claimed)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Taxable Income</span>
                  <span>{formatCurrency(form16Data.taxable_income)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Tax Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Income Tax</span>
                  <span className="font-medium">{formatCurrency(form16Data.income_tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Education Cess</span>
                  <span className="font-medium">{formatCurrency(form16Data.education_cess)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Tax</span>
                  <span>{formatCurrency(form16Data.total_tax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg text-green-600">
                  <span>TDS Deducted</span>
                  <span>{formatCurrency(form16Data.tds_deducted)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      {form16Data.previous_employer_details && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Employer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{form16Data.previous_employer_details}</p>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>This is a computer-generated document and does not require a signature.</p>
            <p className="mt-2">
              Generated on: {form16Data.generated_date ? formatDate(form16Data.generated_date) : 'Not generated'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
