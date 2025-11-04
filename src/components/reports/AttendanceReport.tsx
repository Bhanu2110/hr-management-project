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

interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  check_in: string;
  check_out: string | null;
  total_hours: number | null;
  status: string;
}

export const AttendanceReport = () => {
  const { themeColor } = useTheme();
  const { toast } = useToast();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<keyof AttendanceRecord>("date");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('attendance')
          .select(`
            id,
            employee_id,
            date,
            intervals,
            total_hours,
            status,
            employees(first_name, last_name)
          `)
          .order('date', { ascending: false });
        
        if (error) {
          throw error;
        }

        const formattedData: AttendanceRecord[] = data.map(item => {
          const intervals = item.intervals as any[] || [];
          const firstInterval = intervals[0];
          const lastInterval = intervals[intervals.length - 1];
          
          return {
            id: item.id,
            employee_id: item.employee_id,
            employee_name: `${item.employees?.first_name} ${item.employees?.last_name}`,
            date: item.date,
            check_in: firstInterval?.check_in ? format(new Date(firstInterval.check_in), 'hh:mm a') : '-',
            check_out: lastInterval?.check_out ? format(new Date(lastInterval.check_out), 'hh:mm a') : '-',
            total_hours: item.total_hours,
            status: item.status,
          };
        });

        setAttendanceRecords(formattedData);
      } catch (error) {
        console.error("Error fetching attendance records:", error);
        toast({
          title: "Error",
          description: "Failed to fetch attendance records.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceRecords();
  }, []);

  const filteredAndSortedAttendanceRecords = attendanceRecords
    .filter((record) =>
      record.employee_name.toLowerCase().includes(filter.toLowerCase()) ||
      record.employee_id.toLowerCase().includes(filter.toLowerCase()) ||
      record.status.toLowerCase().includes(filter.toLowerCase()) ||
      record.date.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (key: keyof AttendanceRecord) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    console.log("Exporting attendance report...");
    // In a real application, you would implement the actual export logic here
    // e.g., using a library like 'xlsx' or 'pdfmake'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading attendance records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter attendance records..."
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
              <TableHead className="cursor-pointer" onClick={() => handleSort('employee_name')}>
                <div className="flex items-center">
                  Employee Name {sortKey === 'employee_name' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                <div className="flex items-center">
                  Date {sortKey === 'date' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('check_in')}>
                <div className="flex items-center">
                  Check In {sortKey === 'check_in' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('check_out')}>
                <div className="flex items-center">
                  Check Out {sortKey === 'check_out' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('total_hours')}>
                <div className="flex items-center">
                  Total Hours {sortKey === 'total_hours' && <ArrowUpDown className="ml-2 h-4 w-4" />}
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
            {filteredAndSortedAttendanceRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.employee_name}</TableCell>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.check_in}</TableCell>
                <TableCell>{record.check_out}</TableCell>
                <TableCell>{record.total_hours !== null ? `${record.total_hours}h` : '-'}</TableCell>
                <TableCell>{record.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
