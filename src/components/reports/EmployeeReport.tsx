import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpDown, FileDown } from "lucide-react";
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { employeeService, Employee } from '@/services/api';
import { Loader2 } from 'lucide-react';

interface EmployeeReportData extends Employee {}

export const EmployeeReport = () => {
  const { themeColor } = useTheme();
  const [employees, setEmployees] = useState<EmployeeReportData[]>([]);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<keyof EmployeeReportData>("first_name");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const employeesData = await employeeService.getAllEmployees();
        setEmployees(employeesData || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const filteredAndSortedEmployees = employees
    .filter((employee) =>
      employee.first_name.toLowerCase().includes(filter.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(filter.toLowerCase()) ||
      employee.employee_id.toLowerCase().includes(filter.toLowerCase()) ||
      employee.department.toLowerCase().includes(filter.toLowerCase()) ||
      employee.position.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (key: keyof EmployeeReportData) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    console.log("Exporting employee report...");
    // In a real application, you would implement the actual export logic here
    // e.g., using a library like 'xlsx' or 'pdfmake'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter employees..."
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
              <TableHead className="cursor-pointer" onClick={() => handleSort('employee_id')}>
                <div className="flex items-center">
                  Employee ID {sortKey === 'employee_id' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('first_name')}>
                <div className="flex items-center">
                  Name {sortKey === 'first_name' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('email')}>
                <div className="flex items-center">
                  Email {sortKey === 'email' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('department')}>
                <div className="flex items-center">
                  Department {sortKey === 'department' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('position')}>
                <div className="flex items-center">
                  Position {sortKey === 'position' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('hire_date')}>
                <div className="flex items-center">
                  Hire Date {sortKey === 'hire_date' && <ArrowUpDown className="ml-2 h-4 w-4" />}
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
            {filteredAndSortedEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.employee_id}</TableCell>
                <TableCell>{employee.first_name} {employee.last_name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.hire_date}</TableCell>
                <TableCell>{employee.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
