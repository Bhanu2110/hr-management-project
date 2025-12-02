import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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
    }).format(amount).replace('₹', '');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const monthName = MONTHS.find(m => m.value === salarySlip.month)?.label || 'Unknown';

  // Calculate LOP (Loss of Pay)
  const lopDays = Math.max(0, salarySlip.working_days - salarySlip.present_days);

  return (
    <div className="max-w-[210mm] mx-auto bg-white text-black p-8 font-sans text-sm">
      {/* Action Buttons (Hidden in Print/PDF) */}
      <div className="flex justify-end mb-6 print:hidden" data-html2canvas-ignore="true">
        {onDownload && (
          <Button onClick={onDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        )}
      </div>

      <div id="salary-slip-content">
        {/* Header Section - Normal Text (No Border) */}
        <div className="text-center mb-4">
          <div className="font-bold py-1 text-lg">
            SYNCALL TECHNOLOGY SOLUTIONS PRIVATE LIMITED
          </div>
          <div className="py-1 text-xs font-medium">
            U72200TG2014PTC093379
          </div>
          <div className="py-1 text-xs">
            H No 4-86, Plot No 8,Road No 2, Ganesh Nagar<br />
            Narapally, K.V Rangareddy<br />
            Hyderabad,Telangana-500088
          </div>
        </div>

        {/* Table 1: Payslip Month & Employee Details */}
        <div className="border border-black mb-[-1px]"> {/* Negative margin to merge borders if needed, or just separate */}
          {/* Payslip Month Header */}
          <div className="text-center font-bold py-2 border-b border-black text-base">
            Payslip for the month of {monthName} - {salarySlip.year}
          </div>

          {/* Employee Details Grid */}
          <div className="grid grid-cols-2">
            {/* Left Column */}
            <div className="border-r border-black">
              <div className="grid grid-cols-[120px_1fr] p-2">
                <div className="font-semibold">Name:</div>
                <div>{salarySlip.employee_name}</div>
              </div>
              <div className="grid grid-cols-[120px_1fr] p-2">
                <div className="font-semibold">Join Date:</div>
                <div>{formatDate(salarySlip.joining_date || '')}</div>
              </div>
              <div className="grid grid-cols-[120px_1fr] p-2">
                <div className="font-semibold">Designation:</div>
                <div>{salarySlip.position}</div>
              </div>
              <div className="grid grid-cols-[120px_1fr] p-2">
                <div className="font-semibold">Department:</div>
                <div>{salarySlip.department}</div>
              </div>
              <div className="grid grid-cols-[120px_1fr] p-2">
                <div className="font-semibold">Location:</div>
                <div>Hyderabad</div>
              </div>
              <div className="grid grid-cols-[120px_1fr] p-2 mt-4">
                <div className="font-semibold">Effective Work Days:</div>
                <div>{salarySlip.present_days}</div>
              </div>
              <div className="grid grid-cols-[120px_1fr] p-2">
                <div className="font-semibold">Days In Month:</div>
                <div>{salarySlip.working_days}</div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="grid grid-cols-[120px_1fr] p-2">
                <div className="font-semibold">Bank Name:</div>
                <div>{salarySlip.bank_name || ''}</div>
              </div>
              <div className="grid grid-cols-[120px_1fr] p-2">
                <div className="font-semibold">Bank Account No.:</div>
                <div>{salarySlip.bank_account_no || ''}</div>
              </div>
              <div className="grid grid-cols-[120px_1fr] p-2">
                <div className="font-semibold">PF No.:</div>
                <div>{salarySlip.pf_number || ''}</div>
              </div>
              <div className="grid grid-cols-[120px_1fr] p-2">
                <div className="font-semibold">PF UAN:</div>
                <div>{salarySlip.uan_number || ''}</div>
              </div>
              <div className="grid grid-cols-[120px_1fr] p-2">
                <div className="font-semibold">ESI No.:</div>
                <div>{salarySlip.esi_number || ''}</div>
              </div>
              <div className="grid grid-cols-[120px_1fr] p-2 mt-4">
                <div className="font-semibold">PAN No.:</div>
                <div>{salarySlip.pan_number || ''}</div>
              </div>
              <div className="grid grid-cols-[120px_1fr] p-2">
                <div className="font-semibold">LOP:</div>
                <div>{lopDays}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Table 2: Salary Details */}
        <div className="border border-black mt-4">
          <div className="grid grid-cols-2 border-b border-black">
            {/* Earnings Header */}
            <div className="border-r border-black">
              <div className="grid grid-cols-[1fr_100px] border-b border-black font-bold p-2">
                <div>Earnings</div>
                <div className="text-right">Amount Rs.</div>
              </div>
              {/* Earnings List */}
              <div className="p-2 space-y-2">
                <div className="grid grid-cols-[1fr_100px]">
                  <div>BASIC</div>
                  <div className="text-right">{formatCurrency(salarySlip.basic_salary)}</div>
                </div>
                <div className="grid grid-cols-[1fr_100px]">
                  <div>HRA</div>
                  <div className="text-right">{formatCurrency(salarySlip.hra)}</div>
                </div>
                <div className="grid grid-cols-[1fr_100px]">
                  <div>CONVEYANCE</div>
                  <div className="text-right">{formatCurrency(salarySlip.transport_allowance)}</div>
                </div>
                <div className="grid grid-cols-[1fr_100px]">
                  <div>MEDICAL ALLOWANCE</div>
                  <div className="text-right">{formatCurrency(salarySlip.medical_allowance)}</div>
                </div>
                <div className="grid grid-cols-[1fr_100px]">
                  <div>LTA</div>
                  <div className="text-right">{formatCurrency(0)}</div>
                </div>
                <div className="grid grid-cols-[1fr_100px]">
                  <div>STATUTORY BONUS</div>
                  <div className="text-right">{formatCurrency(0)}</div>
                </div>
                <div className="grid grid-cols-[1fr_100px]">
                  <div>SPECIAL ALLOWANCE</div>
                  <div className="text-right">{formatCurrency(salarySlip.special_allowance)}</div>
                </div>
                <div className="grid grid-cols-[1fr_100px]">
                  <div>VARIABLE PAY</div>
                  <div className="text-right">{formatCurrency(salarySlip.performance_bonus)}</div>
                </div>
                <div className="grid grid-cols-[1fr_100px]">
                  <div>INCENTIVES</div>
                  <div className="text-right">{formatCurrency(salarySlip.other_allowances)}</div>
                </div>
              </div>
            </div>

            {/* Deductions Header */}
            <div>
              <div className="grid grid-cols-[1fr_100px] border-b border-black font-bold p-2">
                <div>Deductions</div>
                <div className="text-right">Amount Rs.</div>
              </div>
              {/* Deductions List */}
              <div className="p-2 space-y-2">
                <div className="grid grid-cols-[1fr_100px]">
                  <div>PROF TAX</div>
                  <div className="text-right">{formatCurrency(salarySlip.professional_tax)}</div>
                </div>
                <div className="grid grid-cols-[1fr_100px]">
                  <div>PROVIDENT FUND</div>
                  <div className="text-right">{formatCurrency(salarySlip.pf_employee)}</div>
                </div>
                <div className="grid grid-cols-[1fr_100px]">
                  <div>INCOME TAX</div>
                  <div className="text-right">{salarySlip.income_tax === 0 ? 'As applicable' : formatCurrency(salarySlip.income_tax)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Totals Row - Side by Side */}
          <div className="grid grid-cols-2 border-b border-black font-bold">
            <div className="border-r border-black p-2">
              Total Earnings: Rs. <span className="float-right">{formatCurrency(salarySlip.gross_earnings)}</span>
            </div>
            <div className="p-2">
              Total Deductions: Rs. <span className="float-right">{formatCurrency(salarySlip.total_deductions)}</span>
            </div>
          </div>

          {/* Net Pay Row - Full Width */}
          <div className="p-2 font-bold">
            Net Pay for the month (Total Earnings - Total Deductions): <span className="float-right">{formatCurrency(salarySlip.net_salary)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 text-xs">
          This is a system generated pay slip and does not require signature.
        </div>
      </div>
    </div>
  );
}
