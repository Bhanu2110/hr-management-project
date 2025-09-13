import React from 'react';
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export interface EmployeeSalaryData {
  id: string;
  name: string;
  designation: string;
  department: string;
  status?: 'pending' | 'approved' | 'rejected';
  netSalary: number;
}

interface SalarySlipProps {
  employee: {
    id: string;
    name: string;
    designation: string;
    department: string;
    bankAccount: string;
  };
  payPeriod: {
    month: string;
    year: number;
  };
  earnings: {
    basic: number;
    hra: number;
    da: number;
    specialAllowance: number;
    overtime: number;
  };
  deductions: {
    pf: number;
    professionalTax: number;
    incomeTax: number;
    loan: number;
    insurance: number;
  };
  salarySummary: {
    gross: number;
    totalDeductions: number;
    net: number;
  };
  paymentInfo: {
    accountLastFour: string;
    creditDate: string;
  };
}

interface EmployeeSalarySlipProps {
  isAdmin?: boolean;
  employeeData?: EmployeeSalaryData;
}

const EmployeeSalarySlip: React.FC<EmployeeSalarySlipProps> = ({ 
  isAdmin = false,
  employeeData
}) => {
  // Generate sample data based on employeeData or use defaults
  const defaultEmployee = employeeData || {
    id: 'EMP001',
    name: 'John Doe',
    designation: 'Employee',
    department: 'General',
    netSalary: 50000
  };

  // Calculate salary components based on net salary
  const calculateSalaryComponents = (netSalary: number) => {
    const basic = Math.round(netSalary * 0.5);
    const hra = Math.round(basic * 0.4);
    const da = Math.round(basic * 0.1);
    const specialAllowance = Math.round(netSalary * 0.2);
    const overtime = 0; // Can be calculated based on attendance if available
    
    const pf = Math.round(basic * 0.12);
    const professionalTax = 200;
    const incomeTax = Math.max(0, Math.round((netSalary - 500000) * 0.05));
    const loan = 0;
    const insurance = 1000;
    
    const gross = basic + hra + da + specialAllowance + overtime;
    const totalDeductions = pf + professionalTax + incomeTax + loan + insurance;
    
    return {
      basic,
      hra,
      da,
      specialAllowance,
      overtime,
      pf,
      professionalTax,
      incomeTax,
      loan,
      insurance,
      gross,
      totalDeductions,
      net: gross - totalDeductions
    };
  };

  const salaryComponents = calculateSalaryComponents(defaultEmployee.netSalary);

  const salaryData: SalarySlipProps = {
    employee: {
      id: defaultEmployee.id,
      name: defaultEmployee.name,
      designation: defaultEmployee.designation,
      department: defaultEmployee.department,
      bankAccount: 'XXXXXX' + defaultEmployee.id.slice(-4),
    },
    payPeriod: {
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear(),
    },
    earnings: {
      basic: salaryComponents.basic,
      hra: salaryComponents.hra,
      da: salaryComponents.da,
      specialAllowance: salaryComponents.specialAllowance,
      overtime: salaryComponents.overtime,
    },
    deductions: {
      pf: salaryComponents.pf,
      professionalTax: salaryComponents.professionalTax,
      incomeTax: salaryComponents.incomeTax,
      loan: salaryComponents.loan,
      insurance: salaryComponents.insurance,
    },
    salarySummary: {
      gross: salaryComponents.gross,
      totalDeductions: salaryComponents.totalDeductions,
      net: salaryComponents.net,
    },
    paymentInfo: {
      accountLastFour: defaultEmployee.id.slice(-4),
      creditDate: new Date().toLocaleDateString('en-GB'),
    },
  };

  const handleDownload = () => {
    // Implement download functionality
    console.log('Downloading salary slip...');
  };

  return (
    <Card className="max-w-4xl mx-auto my-8 p-6">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">SALARY SLIP</h2>
          <p className="text-muted-foreground">
            {salaryData.payPeriod.month} {salaryData.payPeriod.year}
          </p>
        </div>
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
      
      <CardContent className="p-0">
        {/* Employee Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Employee Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><span className="font-medium">Employee ID:</span> {salaryData.employee.id}</p>
              <p><span className="font-medium">Name:</span> {salaryData.employee.name}</p>
            </div>
            <div>
              <p><span className="font-medium">Designation:</span> {salaryData.employee.designation}</p>
              <p><span className="font-medium">Department:</span> {salaryData.employee.department}</p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Earnings Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Earnings</h3>
          <div className="space-y-2">
            {[
              { label: 'Basic Salary', value: salaryData.earnings.basic },
              { label: 'House Rent Allowance (HRA)', value: salaryData.earnings.hra },
              { label: 'Dearness Allowance (DA)', value: salaryData.earnings.da },
              { label: 'Special Allowance', value: salaryData.earnings.specialAllowance },
              { label: 'Overtime Pay', value: salaryData.earnings.overtime },
            ].map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.label}</span>
                <span>₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Deductions Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Deductions</h3>
          <div className="space-y-2">
            {[
              { label: 'Provident Fund (PF)', value: salaryData.deductions.pf },
              { label: 'Professional Tax', value: salaryData.deductions.professionalTax },
              { label: 'Income Tax (TDS)', value: salaryData.deductions.incomeTax },
              { label: 'Loan/Advance', value: salaryData.deductions.loan },
              { label: 'Insurance', value: salaryData.deductions.insurance },
            ].map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.label}</span>
                <span>-₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Salary Summary */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Salary Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Gross Salary</span>
              <span className="font-medium">₹{salaryData.salarySummary.gross.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total Deductions</span>
              <span className="font-medium">-₹{salaryData.salarySummary.totalDeductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-lg font-semibold">Net Salary</span>
              <span className="text-lg font-bold text-primary">
                ₹{salaryData.salarySummary.net.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Payment Information */}
        <div>
          <h4 className="font-medium mb-2">Payment Information</h4>
          <div className="space-y-1">
            <p>Bank Account: ••••{salaryData.paymentInfo.accountLastFour}</p>
            <p>Salary Credit Date: {salaryData.paymentInfo.creditDate}</p>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline">
              Edit
            </Button>
            <Button>
              Process Payment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeSalarySlip;
