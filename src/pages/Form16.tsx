import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Form16Management } from "@/components/form16/Form16Management";
import { Form16Certificate } from "@/components/form16/Form16Certificate";
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
import { FileText, Download, Calendar, AlertCircle } from "lucide-react";
import { Form16Data } from "@/types/form16";

const Form16 = () => {
  const { isAdmin, employee } = useAuth();
  const [selectedYear, setSelectedYear] = useState("2024-25");
  const [selectedForm16, setSelectedForm16] = useState<Form16Data | null>(null);

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

  // Mock Form 16 data for employee view
  const mockEmployeeForm16: Form16Data[] = [
    {
      id: "1",
      employee_id: employee?.employee_id || "EMP001",
      employee_name: `${employee?.first_name || "John"} ${employee?.last_name || "Doe"}`,
      employee_email: employee?.email || "john.doe@company.com",
      pan_number: "ABCDE1234F",
      assessment_year: "2024-25",
      financial_year: "2023-24",
      employer_name: "Tech Solutions Pvt Ltd",
      employer_address: "123 Business Park, Tech City, State - 400001",
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
      employee_id: employee?.employee_id || "EMP001",
      employee_name: `${employee?.first_name || "John"} ${employee?.last_name || "Doe"}`,
      employee_email: employee?.email || "john.doe@company.com",
      pan_number: "ABCDE1234F",
      assessment_year: "2023-24",
      financial_year: "2022-23",
      employer_name: "Tech Solutions Pvt Ltd",
      employer_address: "123 Business Park, Tech City, State - 400001",
      employer_tan: "ABCD12345E",
      basic_salary: 550000,
      hra: 220000,
      special_allowance: 110000,
      other_allowances: 20000,
      gross_salary: 900000,
      pf_employee: 21600,
      pf_employer: 21600,
      esi_employee: 0,
      esi_employer: 0,
      professional_tax: 2400,
      other_deductions: 0,
      total_deductions: 24000,
      taxable_income: 826000,
      income_tax: 87500,
      education_cess: 3500,
      total_tax: 91000,
      tds_deducted: 91000,
      exemptions_claimed: 0,
      standard_deduction: 50000,
      status: "issued",
      generated_date: "2023-03-15T10:00:00Z",
      issued_date: "2023-03-16T10:00:00Z",
      created_at: "2023-03-10T10:00:00Z",
      updated_at: "2023-03-16T10:00:00Z",
    },
  ];

  const currentForm16 = mockEmployeeForm16.find(form => form.assessment_year === selectedYear);

  const handleDownload = () => {
    console.log("Downloading Form 16 PDF...");
    // Mock download functionality
  };

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

  if (isAdmin) {
    return (
      <AppLayout>
        <Form16Management employees={mockEmployees} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Employee Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Form 16</h1>
            <p className="text-muted-foreground">
              View and download your tax certificates
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-25">2024-25</SelectItem>
                <SelectItem value="2023-24">2023-24</SelectItem>
                <SelectItem value="2022-23">2022-23</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Available Forms Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockEmployeeForm16.map((form16) => (
            <Card key={form16.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{form16.assessment_year}</span>
                  </div>
                  <Badge className={getStatusColor(form16.status)}>
                    {form16.status.charAt(0).toUpperCase() + form16.status.slice(1)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gross Salary:</span>
                    <span className="font-medium">{formatCurrency(form16.gross_salary)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax Deducted:</span>
                    <span className="font-medium">{formatCurrency(form16.tds_deducted)}</span>
                  </div>
                  {form16.issued_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Issued:</span>
                      <span className="font-medium">
                        {new Date(form16.issued_date).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
                {form16.status === 'issued' && (
                  <Button 
                    className="w-full mt-4 gap-2" 
                    size="sm"
                    onClick={() => setSelectedForm16(form16)}
                  >
                    <FileText className="h-4 w-4" />
                    View Certificate
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Form 16 Display */}
        {currentForm16 ? (
          <Form16Certificate 
            form16Data={currentForm16} 
            onDownload={handleDownload}
          />
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Form 16 Available</h3>
              <p className="text-muted-foreground">
                Form 16 for assessment year {selectedYear} is not yet available. 
                Please contact HR for more information.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Selected Form 16 Modal/Overlay */}
        {selectedForm16 && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg max-w-6xl max-h-[90vh] overflow-y-auto w-full">
              <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Form 16 - {selectedForm16.assessment_year}
                </h2>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedForm16(null)}
                >
                  Close
                </Button>
              </div>
              <div className="p-6">
                <Form16Certificate 
                  form16Data={selectedForm16} 
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

export default Form16;