import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AttendanceRecord {
  id: string;
  employee_name: string;
  check_in: string;
  check_out: string | null;
  total_hours: number | null;
  status: string;
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  total: number;
}

export const AdminAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({ present: 0, absent: 0, late: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      // Fetch today's attendance with employee names
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          id,
          check_in,
          check_out,
          total_hours,
          status,
          employees!inner(first_name, last_name)
        `)
        .gte('check_in', new Date().toISOString().split('T')[0]);

      if (attendanceError) throw attendanceError;

      // Transform data
      const records: AttendanceRecord[] = attendanceData?.map((record: any) => ({
        id: record.id,
        employee_name: `${record.employees.first_name} ${record.employees.last_name}`,
        check_in: record.check_in,
        check_out: record.check_out,
        total_hours: record.total_hours,
        status: record.status
      })) || [];

      setAttendanceRecords(records);

      // Calculate stats
      const present = records.filter(r => r.status === 'checked_in' || r.status === 'checked_out').length;
      const late = records.filter(r => {
        if (r.check_in) {
          const checkInTime = new Date(r.check_in);
          const nineAM = new Date();
          nineAM.setHours(9, 0, 0, 0);
          return checkInTime > nineAM;
        }
        return false;
      }).length;

      // Get total employees count
      const { count: totalEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      const absent = (totalEmployees || 0) - present;

      setStats({
        present,
        absent,
        late,
        total: totalEmployees || 0
      });

    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatHours = (hours: number | null) => {
    if (!hours) return '0h 00m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  const getStatusBadge = (status: string, checkOut: string | null) => {
    if (status === 'checked_out' || checkOut) {
      return <Badge className="bg-success text-success-foreground">Present</Badge>;
    } else if (status === 'checked_in') {
      return <Badge className="bg-primary text-primary-foreground">Checked In</Badge>;
    } else {
      return <Badge variant="destructive">Absent</Badge>;
    }
  };

  const attendanceRate = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : '0';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading attendance data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance Management</h1>
        <p className="text-muted-foreground">Track and monitor employee attendance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Present Today</p>
                <p className="text-xl font-bold text-foreground">{stats.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Absent Today</p>
                <p className="text-xl font-bold text-foreground">{stats.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Late Check-ins</p>
                <p className="text-xl font-bold text-foreground">{stats.late}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-xl font-bold text-foreground">{attendanceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Check In</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Check Out</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total Hours</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((record) => (
                    <tr key={record.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium">{record.employee_name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{formatTime(record.check_in)}</td>
                      <td className="py-3 px-4 text-muted-foreground">{formatTime(record.check_out)}</td>
                      <td className="py-3 px-4 text-muted-foreground">{formatHours(record.total_hours)}</td>
                      <td className="py-3 px-4">
                        {getStatusBadge(record.status, record.check_out)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No attendance records found for today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};