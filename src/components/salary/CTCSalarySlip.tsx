import { SalarySlip } from "@/types/salary";

interface CTCSalarySlipProps {
  salarySlip: SalarySlip;
}

export function CTCSalarySlip({ salarySlip }: CTCSalarySlipProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const monthlyToAnnual = (monthly: number) => monthly * 12;

  // Calculate CTC components
  const basicSalary = salarySlip.basic_salary;
  const hra = salarySlip.hra;
  const conveyanceAllowance = salarySlip.transport_allowance;
  const medicalAllowance = salarySlip.medical_allowance;
  const mealAllowance = salarySlip.other_allowances * 0.2; // Assuming 20% of other allowances
  const lta = salarySlip.other_allowances * 0.3; // Assuming 30% of other allowances
  const statutoryBonus = salarySlip.performance_bonus * 0.5;
  const projectAllowance = salarySlip.special_allowance;
  
  const grossSalary = salarySlip.gross_earnings;
  
  // Employer benefits
  const performanceBonus = salarySlip.performance_bonus * 0.5;
  const pfEmployer = salarySlip.pf_employer;
  const esiEmployer = salarySlip.esi_employer;
  const gratuity = basicSalary * 0.0481; // 4.81% of basic
  
  const ctc = grossSalary + pfEmployer + esiEmployer + gratuity + performanceBonus;
  
  // Employee cash earnings
  const employeeCashEarnings = grossSalary;
  
  // Deductions
  const pfEmployee = salarySlip.pf_employee;
  const professionalTax = salarySlip.professional_tax;
  const esiEmployee = salarySlip.esi_employee;
  const medicalInsurance = salarySlip.medical_insurance;
  const incomeTax = salarySlip.income_tax;
  
  const totalDeductions = salarySlip.total_deductions;
  const netSalary = salarySlip.net_salary;

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Employee Details Table */}
      <table className="w-full border-collapse mb-4" style={{ border: '1px solid #000' }}>
        <tbody>
          <tr>
            <td className="border border-black p-2 font-semibold" style={{ width: '30%' }}>Employee Name:</td>
            <td className="border border-black p-2 bg-gray-100" style={{ width: '70%' }}>{salarySlip.employee_name}</td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">PAN No:</td>
            <td className="border border-black p-2 bg-gray-100">XXXXXXXXXX</td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">Emp ID:</td>
            <td className="border border-black p-2 bg-gray-100">{salarySlip.employee_id}</td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">Designation:</td>
            <td className="border border-black p-2 bg-gray-100">{salarySlip.position}</td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">Date of Joining</td>
            <td className="border border-black p-2 bg-gray-100">-</td>
          </tr>
        </tbody>
      </table>

      {/* CTC Breakdown Header */}
      <div className="text-center font-bold p-3 mb-0" style={{ backgroundColor: '#FFA500', border: '1px solid #000', borderBottom: 'none' }}>
        CTC - SALARY BREAKUP - (YEARLY &amp; MONTHLY)
      </div>

      {/* Main Salary Table */}
      <table className="w-full border-collapse" style={{ border: '1px solid #000' }}>
        <thead>
          <tr style={{ backgroundColor: '#00B050' }}>
            <th className="border border-black p-2 text-left font-bold">Breakup of the salary</th>
            <th className="border border-black p-2 text-center font-bold" style={{ width: '25%' }}>Monthly Amount<br/>Rs.</th>
            <th className="border border-black p-2 text-center font-bold" style={{ width: '25%' }}>Annual Amount<br/>Rs.</th>
          </tr>
        </thead>
        <tbody>
          {/* Salary Components Section */}
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td className="border border-black p-2" rowSpan={8}>
              <div className="transform -rotate-90 origin-center whitespace-nowrap font-bold" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                Salary Components
              </div>
            </td>
            <td className="border border-black p-2">CTC (Cost to the Company)</td>
            <td className="border border-black p-2 text-right">{formatCurrency(ctc / 12)}</td>
            <td className="border border-black p-2 text-right">{formatCurrency(ctc)}</td>
          </tr>
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td className="border border-black p-2">Basic Salary (50% Gross)</td>
            <td className="border border-black p-2 text-right">{formatCurrency(basicSalary)}</td>
            <td className="border border-black p-2 text-right">{formatCurrency(monthlyToAnnual(basicSalary))}</td>
          </tr>
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td className="border border-black p-2">HRA (40% of Basic)</td>
            <td className="border border-black p-2 text-right">{formatCurrency(hra)}</td>
            <td className="border border-black p-2 text-right">{formatCurrency(monthlyToAnnual(hra))}</td>
          </tr>
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td className="border border-black p-2">Conveyance Allowance</td>
            <td className="border border-black p-2 text-right">{formatCurrency(conveyanceAllowance)}</td>
            <td className="border border-black p-2 text-right">{formatCurrency(monthlyToAnnual(conveyanceAllowance))}</td>
          </tr>
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td className="border border-black p-2">Medical Allowance</td>
            <td className="border border-black p-2 text-right">{formatCurrency(medicalAllowance)}</td>
            <td className="border border-black p-2 text-right">{formatCurrency(monthlyToAnnual(medicalAllowance))}</td>
          </tr>
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td className="border border-black p-2">Meal Allowance</td>
            <td className="border border-black p-2 text-right">{formatCurrency(mealAllowance)}</td>
            <td className="border border-black p-2 text-right">{formatCurrency(monthlyToAnnual(mealAllowance))}</td>
          </tr>
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td className="border border-black p-2">LTA</td>
            <td className="border border-black p-2 text-right">{formatCurrency(lta)}</td>
            <td className="border border-black p-2 text-right">{formatCurrency(monthlyToAnnual(lta))}</td>
          </tr>
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td className="border border-black p-2">Statutory Bonus</td>
            <td className="border border-black p-2 text-right">{formatCurrency(statutoryBonus)}</td>
            <td className="border border-black p-2 text-right">{formatCurrency(monthlyToAnnual(statutoryBonus))}</td>
          </tr>
          
          {/* Gross Salary */}
          <tr>
            <td colSpan={2} className="border border-black p-2 font-bold text-center">Gross Salary</td>
            <td className="border border-black p-2 text-right font-bold">{formatCurrency(grossSalary)}</td>
            <td className="border border-black p-2 text-right font-bold">{formatCurrency(monthlyToAnnual(grossSalary))}</td>
          </tr>

          {/* Employer Benefits */}
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td className="border border-black p-2" rowSpan={5}>
              <div className="transform -rotate-90 origin-center whitespace-nowrap font-bold" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                Employer Benefits
              </div>
            </td>
            <td className="border border-black p-2">Performance Bonus / Variable Pay</td>
            <td className="border border-black p-2 text-right">{formatCurrency(performanceBonus)}</td>
            <td className="border border-black p-2 text-right">{formatCurrency(monthlyToAnnual(performanceBonus))}</td>
          </tr>
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td className="border border-black p-2">PF (Employer Contribution)</td>
            <td className="border border-black p-2 text-right">{formatCurrency(pfEmployer)}</td>
            <td className="border border-black p-2 text-right">{formatCurrency(monthlyToAnnual(pfEmployer))}</td>
          </tr>
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td className="border border-black p-2">ESI (Employer Contribution)</td>
            <td className="border border-black p-2 text-right">{formatCurrency(esiEmployer)}</td>
            <td className="border border-black p-2 text-right">{formatCurrency(monthlyToAnnual(esiEmployer))}</td>
          </tr>
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td className="border border-black p-2">Gratuity Contribution</td>
            <td className="border border-black p-2 text-right">{formatCurrency(gratuity)}</td>
            <td className="border border-black p-2 text-right">{formatCurrency(monthlyToAnnual(gratuity))}</td>
          </tr>
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td colSpan={3} className="border border-black p-2"></td>
          </tr>

          {/* Cost to Company */}
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td colSpan={2} className="border border-black p-2 font-bold text-center">Cost To the Company</td>
            <td className="border border-black p-2 text-right font-bold">{formatCurrency(ctc / 12)}</td>
            <td className="border border-black p-2 text-right font-bold">{formatCurrency(ctc)}</td>
          </tr>

          {/* Employee Cash Earnings */}
          <tr>
            <td colSpan={2} className="border border-black p-2 font-bold">Employee Cash Earnings</td>
            <td className="border border-black p-2 text-right font-bold">{formatCurrency(employeeCashEarnings)}</td>
            <td className="border border-black p-2 text-right font-bold">{formatCurrency(monthlyToAnnual(employeeCashEarnings))}</td>
          </tr>

          {/* Deductions Section */}
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td className="border border-black p-2" rowSpan={5}>
              <div className="transform -rotate-90 origin-center whitespace-nowrap font-bold" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                Deductions
              </div>
            </td>
            <td className="border border-black p-2">PF (Employee contribution)</td>
            <td className="border border-black p-2 text-right">{formatCurrency(pfEmployee)}</td>
            <td className="border border-black p-2 text-right">{formatCurrency(monthlyToAnnual(pfEmployee))}</td>
          </tr>
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td className="border border-black p-2">Professional Tax</td>
            <td className="border border-black p-2 text-right">{formatCurrency(professionalTax)}</td>
            <td className="border border-black p-2 text-right">{formatCurrency(monthlyToAnnual(professionalTax))}</td>
          </tr>
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td className="border border-black p-2">ESI</td>
            <td className="border border-black p-2 text-right">{formatCurrency(esiEmployee)}</td>
            <td className="border border-black p-2 text-right">{formatCurrency(monthlyToAnnual(esiEmployee))}</td>
          </tr>
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td className="border border-black p-2">Medical Insurance</td>
            <td className="border border-black p-2 text-right">{formatCurrency(medicalInsurance)}</td>
            <td className="border border-black p-2 text-right">{formatCurrency(monthlyToAnnual(medicalInsurance))}</td>
          </tr>
          <tr style={{ backgroundColor: '#FFFF00' }}>
            <td className="border border-black p-2">Income Tax</td>
            <td className="border border-black p-2 text-right">{formatCurrency(incomeTax)}</td>
            <td className="border border-black p-2 text-right">{formatCurrency(monthlyToAnnual(incomeTax))}</td>
          </tr>

          {/* Total Deductions */}
          <tr>
            <td colSpan={2} className="border border-black p-2 font-bold text-center">Total Deductions</td>
            <td className="border border-black p-2 text-right font-bold">{formatCurrency(totalDeductions)}</td>
            <td className="border border-black p-2 text-right font-bold">{formatCurrency(monthlyToAnnual(totalDeductions))}</td>
          </tr>

          {/* Net Salary */}
          <tr style={{ backgroundColor: '#00B050' }}>
            <td colSpan={2} className="border border-black p-2 font-bold text-center">Net Salary</td>
            <td className="border border-black p-2 text-right font-bold">{formatCurrency(netSalary)}</td>
            <td className="border border-black p-2 text-right font-bold">{formatCurrency(monthlyToAnnual(netSalary))}</td>
          </tr>
        </tbody>
      </table>

      {/* Notes Section */}
      <div className="mt-6 text-xs leading-relaxed">
        <p className="font-bold mb-2">Note:-</p>
        <p className="mb-1">Deductions will be made towards Professional Tax, Employee Contribution towards Provident Fund, Income tax, and any other applicable.</p>
        <p className="mb-1">PF benefits, as per the Employees Provident Funds &amp; Misc (EPF &amp; MP) Act 1952, are payable only after an employee completes 5 years of his continuous service.</p>
        <p className="mb-1">Gratuity shall be payable as per the Gratuity Act 1972, gratuity is payable only if an employee completes 5 years of his continuous service.</p>
        <p>Based on your performance, the Monthly Performance Variable component will be paid on Half yearly.</p>
      </div>
    </div>
  );
}
