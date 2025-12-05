import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SalarySlip, MONTHS } from '@/types/salary';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const generateSalarySlipPDF = (salarySlip: SalarySlip): jsPDF => {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  // Company Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SYNCALL TECHNOLOGY SOLUTIONS PRIVATE LIMITED', pageWidth / 2, y, { align: 'center' });
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('U72200TG2014PTC093379', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(8);
  doc.text('H No 4-86, Plot No 8, Road No 2, Ganesh Nagar', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text('Narapally, K.V Rangareddy, Hyderabad, Telangana-500088', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Payslip Month Header
  const monthName = MONTHS.find(m => m.value === salarySlip.month)?.label || 'Unknown';
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setDrawColor(0);
  doc.rect(margin, y, contentWidth, 8, 'S');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Payslip for the month of ${monthName} - ${salarySlip.year}`, pageWidth / 2, y + 5.5, { align: 'center' });
  y += 12;

  // Employee Details Table
  const lopDays = Math.max(0, salarySlip.working_days - salarySlip.present_days);
  const leftColWidth = contentWidth / 2;
  const lineHeight = 7;
  const employeeDetailsHeight = lineHeight * 7 + 6;

  // Draw outer border for employee details
  doc.setDrawColor(0);
  doc.rect(margin, y, contentWidth, employeeDetailsHeight, 'S');
  doc.line(margin + leftColWidth, y, margin + leftColWidth, y + employeeDetailsHeight);

  doc.setFontSize(9);
  let leftY = y + 7;
  let rightY = y + 7;
  const labelWidthLeft = 38;
  const labelWidthRight = 38;

  // Left Column Details
  const leftDetails = [
    { label: 'Name:', value: salarySlip.employee_name },
    { label: 'Join Date:', value: formatDate(salarySlip.joining_date || '') },
    { label: 'Designation:', value: salarySlip.position },
    { label: 'Department:', value: salarySlip.department },
    { label: 'Location:', value: 'Hyderabad' },
    { label: 'Effective Work Days:', value: String(salarySlip.present_days) },
    { label: 'Days In Month:', value: String(salarySlip.working_days) },
  ];

  leftDetails.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.text(item.label, margin + 3, leftY);
    doc.setFont('helvetica', 'normal');
    doc.text(item.value || '', margin + labelWidthLeft + 3, leftY);
    leftY += lineHeight;
  });

  // Right Column Details
  const rightDetails = [
    { label: 'Bank Name:', value: salarySlip.bank_name || '' },
    { label: 'Bank Account No.:', value: salarySlip.bank_account_no || '' },
    { label: 'PF No.:', value: salarySlip.pf_number || '' },
    { label: 'PF UAN:', value: salarySlip.uan_number || '' },
    { label: 'ESI No.:', value: salarySlip.esi_number || '' },
    { label: 'PAN No.:', value: salarySlip.pan_number || '' },
    { label: 'LOP:', value: String(lopDays) },
  ];

  rightDetails.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.text(item.label, margin + leftColWidth + 3, rightY);
    doc.setFont('helvetica', 'normal');
    doc.text(item.value || '', margin + leftColWidth + labelWidthRight + 3, rightY);
    rightY += lineHeight;
  });

  y += employeeDetailsHeight + 5;

  // Earnings and Deductions Data
  const earnings = [
    ['BASIC', formatCurrency(salarySlip.basic_salary)],
    ['HRA', formatCurrency(salarySlip.hra)],
    ['CONVEYANCE', formatCurrency(salarySlip.transport_allowance)],
    ['MEDICAL ALLOWANCE', formatCurrency(salarySlip.medical_allowance)],
    ['LTA', formatCurrency(0)],
    ['STATUTORY BONUS', formatCurrency(0)],
    ['SPECIAL ALLOWANCE', formatCurrency(salarySlip.special_allowance)],
    ['VARIABLE PAY', formatCurrency(salarySlip.performance_bonus)],
    ['INCENTIVES', formatCurrency(salarySlip.other_allowances)],
  ];

  const deductions = [
    ['PROF TAX', formatCurrency(salarySlip.professional_tax)],
    ['PROVIDENT FUND', formatCurrency(salarySlip.pf_employee)],
    ['INCOME TAX', salarySlip.income_tax === 0 ? 'As applicable' : formatCurrency(salarySlip.income_tax)],
  ];

  // Table dimensions
  const colWidth = contentWidth / 2;
  const headerHeight = 8;
  const rowHeight = 7;
  const maxRows = earnings.length;
  const dataHeight = maxRows * rowHeight;
  const totalsHeight = 8;
  const netPayHeight = 8;
  const totalTableHeight = headerHeight + dataHeight + totalsHeight + netPayHeight;
  const salaryTableY = y;

  // Draw outer border
  doc.setDrawColor(0);
  doc.rect(margin, salaryTableY, contentWidth, totalTableHeight, 'S');

  // Draw vertical divider between earnings and deductions (up to totals row)
  doc.line(margin + colWidth, salaryTableY, margin + colWidth, salaryTableY + headerHeight + dataHeight + totalsHeight);

  // ===== HEADERS =====
  // Earnings Header with gray background
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, salaryTableY, colWidth, headerHeight, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Earnings', margin + 3, salaryTableY + 5.5);
  doc.text('Amount Rs.', margin + colWidth - 5, salaryTableY + 5.5, { align: 'right' });

  // Deductions Header with gray background
  doc.setFillColor(240, 240, 240);
  doc.rect(margin + colWidth, salaryTableY, colWidth, headerHeight, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.text('Deductions', margin + colWidth + 3, salaryTableY + 5.5);
  doc.text('Amount Rs.', margin + contentWidth - 5, salaryTableY + 5.5, { align: 'right' });

  // ===== EARNINGS DATA =====
  doc.setFont('helvetica', 'normal');
  let earningsY = salaryTableY + headerHeight + 5;
  earnings.forEach((row) => {
    doc.text(row[0], margin + 3, earningsY);
    doc.text(row[1], margin + colWidth - 5, earningsY, { align: 'right' });
    earningsY += rowHeight;
  });

  // ===== DEDUCTIONS DATA =====
  let deductionsY = salaryTableY + headerHeight + 5;
  deductions.forEach((row) => {
    doc.text(row[0], margin + colWidth + 3, deductionsY);
    doc.text(row[1], margin + contentWidth - 5, deductionsY, { align: 'right' });
    deductionsY += rowHeight;
  });

  // ===== TOTALS ROW =====
  const totalsY = salaryTableY + headerHeight + dataHeight;
  doc.line(margin, totalsY, margin + contentWidth, totalsY);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Earnings: Rs.', margin + 3, totalsY + 5.5);
  doc.text(formatCurrency(salarySlip.gross_earnings), margin + colWidth - 5, totalsY + 5.5, { align: 'right' });
  doc.text('Total Deductions: Rs.', margin + colWidth + 3, totalsY + 5.5);
  doc.text(formatCurrency(salarySlip.total_deductions), margin + contentWidth - 5, totalsY + 5.5, { align: 'right' });

  // ===== NET PAY ROW =====
  const netPayY = totalsY + totalsHeight;
  doc.line(margin, netPayY, margin + contentWidth, netPayY);
  doc.setFont('helvetica', 'bold');
  doc.text('Net Pay for the month (Total Earnings - Total Deductions):', margin + 3, netPayY + 5.5);
  doc.text(formatCurrency(salarySlip.net_salary), margin + contentWidth - 5, netPayY + 5.5, { align: 'right' });

  // ===== FOOTER =====
  y = salaryTableY + totalTableHeight + 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a system generated pay slip and does not require signature.', pageWidth / 2, y, { align: 'center' });

  return doc;
};

export const downloadSalarySlipPDF = (salarySlip: SalarySlip): void => {
  const doc = generateSalarySlipPDF(salarySlip);
  const monthName = MONTHS.find(m => m.value === salarySlip.month)?.label || 'Unknown';
  doc.save(`salary-slip-${salarySlip.employee_name}-${monthName}-${salarySlip.year}.pdf`);
};
