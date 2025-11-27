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

interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: string;
}

export const LeaveReport = () => {
  const { themeColor } = useTheme();
  const { toast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<keyof LeaveRequest>("start_date");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('leave_requests')
          .select(`
            id,
            employee_id,
            leave_type,
            start_date,
            end_date,
            days,
            reason,
            status,
            employees(first_name, last_name)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        const formattedData: LeaveRequest[] = data.map(item => ({
          id: item.id,
          employee_id: item.employee_id,
          employee_name: `${item.employees?.first_name} ${item.employees?.last_name}`,
          leave_type: item.leave_type,
          start_date: format(new Date(item.start_date), 'yyyy-MM-dd'),
          end_date: format(new Date(item.end_date), 'yyyy-MM-dd'),
          days: item.days,
          reason: item.reason,
          status: item.status,
        }));

        setLeaveRequests(formattedData);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
        toast({
          title: "Error",
          description: "Failed to fetch leave requests.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  const filteredAndSortedLeaveRequests = leaveRequests
    .filter((request) =>
      request.employee_name.toLowerCase().includes(filter.toLowerCase()) ||
      request.employee_id.toLowerCase().includes(filter.toLowerCase()) ||
      request.leave_type.toLowerCase().includes(filter.toLowerCase()) ||
      request.status.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (key: keyof LeaveRequest) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    console.log("Exporting leave report...");
    // In a real application, you would implement the actual export logic here
    // e.g., using a library like 'xlsx' or 'pdfmake'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading leave requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter leave requests..."
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
              <TableHead className="cursor-pointer" onClick={() => handleSort('leave_type')}>
                <div className="flex items-center">
                  Leave Type {sortKey === 'leave_type' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('start_date')}>
                <div className="flex items-center">
                  Start Date {sortKey === 'start_date' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('end_date')}>
                <div className="flex items-center">
                  End Date {sortKey === 'end_date' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('days')}>
                <div className="flex items-center">
                  Days {sortKey === 'days' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center">
                  Status {sortKey === 'status' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedLeaveRequests.map((request, index) => (
              <TableRow key={request.id}>
                <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium">{request.employee_name}</TableCell>
                <TableCell>{request.leave_type}</TableCell>
                <TableCell>{request.start_date}</TableCell>
                <TableCell>{request.end_date}</TableCell>
                <TableCell>{request.days}</TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell>{request.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
