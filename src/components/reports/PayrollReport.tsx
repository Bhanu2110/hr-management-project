import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpDown, FileDown, Loader2 } from "lucide-react";
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface PayrollRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  pay_period_start: string;
  pay_period_end: string;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  status: string;
  created_at: string;
}

export const PayrollReport = () => {
  const { themeColor } = useTheme();
  const { toast } = useToast();
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<keyof PayrollRecord>("pay_period_start");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayrollRecords = async () => {
      setIsLoading(true);
      try {
        // @ts-ignore - salary_slips table exists but types may need regeneration
        const { data, error } = await (supabase as any)
          .from('salary_slips')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        const formattedData: PayrollRecord[] = (data || []).map((item: any) => ({
          id: item.id,
          employee_id: item.employee_id,
          employee_name: item.employee_name,
          pay_period_start: format(new Date(item.pay_period_start), 'yyyy-MM-dd'),
          pay_period_end: format(new Date(item.pay_period_end), 'yyyy-MM-dd'),
          gross_salary: item.gross_earnings,
          deductions: item.total_deductions,
          net_salary: item.net_salary,
          status: item.status,
          created_at: item.created_at,
        }));

        setPayrollRecords(formattedData);
      } catch (error) {
        console.error("Error fetching payroll records:", error);
        toast({
          title: "Error",
          description: "Failed to fetch payroll records.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayrollRecords();
  }, []);

  const filteredAndSortedPayrollRecords = payrollRecords
    .filter((record) =>
      record.employee_name.toLowerCase().includes(filter.toLowerCase()) ||
      record.employee_id.toLowerCase().includes(filter.toLowerCase()) ||
      record.pay_period_start.toLowerCase().includes(filter.toLowerCase()) ||
      record.pay_period_end.toLowerCase().includes(filter.toLowerCase()) ||
      record.status.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

  const handleSort = (key: keyof PayrollRecord) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    console.log("Exporting payroll report...");
    // In a real application, you would implement the actual export logic here
    // e.g., using a library like 'xlsx' or 'pdfmake'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading payroll records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter payroll records..."
            className="pl-10"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <Button style={{ backgroundColor: themeColor, borderColor: themeColor }} className="text-white" onClick={handleExport}>
          <FileDown className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">S.No</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('employee_name')}>
                <div className="flex items-center">
                  Employee Name {sortKey === 'employee_name' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('pay_period_start')}>
                <div className="flex items-center">
                  Pay Period {sortKey === 'pay_period_start' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('gross_salary')}>
                <div className="flex items-center">
                  Gross Salary {sortKey === 'gross_salary' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('deductions')}>
                <div className="flex items-center">
                  Deductions {sortKey === 'deductions' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('net_salary')}>
                <div className="flex items-center">
                  Net Salary {sortKey === 'net_salary' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center">
                  Status {sortKey === 'status' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedPayrollRecords.map((record, index) => (
              <TableRow key={record.id}>
                <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium">{record.employee_name}</TableCell>
                <TableCell>{record.pay_period_start} to {record.pay_period_end}</TableCell>
                <TableCell>{record.gross_salary.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                <TableCell>{record.deductions.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                <TableCell>{record.net_salary.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                <TableCell>{record.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};