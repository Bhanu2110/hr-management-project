import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AttendanceInterval {
  check_in: string;
  check_out?: string;
}

interface AttendanceRecord {
  id: string;
  employee_name: string;
  employee_id: string;
  intervals: AttendanceInterval[];
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
      const today = new Date().toISOString().split('T')[0];

      // Fetch today's attendance with employee names
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          id,
          date,
          intervals,
          total_hours,
          status,
          employee_id,
          employees!attendance_employee_id_fkey(first_name, last_name)
        `)
        .eq('date', today);

      if (attendanceError) {
        console.error('Error fetching attendance:', attendanceError);
        throw attendanceError;
      }

      // Transform data
      const records: AttendanceRecord[] = attendanceData?.map((record: any) => {
        const intervals = (record.intervals as AttendanceInterval[]) || [];

        return {
          id: record.id,
          employee_name: `${record.employees.first_name} ${record.employees.last_name}`,
          employee_id: record.employee_id,
          intervals: intervals,
          total_hours: record.total_hours,
          status: record.status
        };
      }) || [];

      setAttendanceRecords(records);

      // Calculate stats
      const present = records.filter(r => r.intervals.length > 0 && r.intervals[0]?.check_in).length;
      const late = records.filter(r => {
        if (r.intervals.length > 0 && r.intervals[0]?.check_in) {
          const checkInTime = new Date(r.intervals[0].check_in);
          const nineAM = new Date(checkInTime);
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

  const getStatusBadge = (intervals: AttendanceInterval[]) => {
    if (intervals.length === 0) {
      return <Badge variant="destructive">Absent</Badge>;
    }
    const lastInterval = intervals[intervals.length - 1];
    if (lastInterval?.check_out) {
      return <Badge className="bg-blue-600 text-white">Complete</Badge>;
    } else {
      return <Badge className="bg-success text-success-foreground">Checked In</Badge>;
    }
  };

  const calculateIntervalHours = (interval: AttendanceInterval): number => {
    if (!interval.check_in || !interval.check_out) return 0;
    const checkIn = new Date(interval.check_in);
    const checkOut = new Date(interval.check_out);
    return (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
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
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground w-[60px]">S.No</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Session</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Check In</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Check Out</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Session Hours</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total Hours</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((record, recordIndex) => (
                    record.intervals.length > 0 ? (
                      record.intervals.map((interval, intervalIndex) => (
                        <tr key={`${record.id}-${intervalIndex}`} className="border-b border-border hover:bg-muted/30 transition-colors">
                          {intervalIndex === 0 ? (
                            <>
                              <td className="py-3 px-4 text-center text-muted-foreground" rowSpan={record.intervals.length}>{recordIndex + 1}</td>
                              <td className="py-3 px-4 font-medium" rowSpan={record.intervals.length}>{record.employee_name}</td>
                            </>
                          ) : null}
                          <td className="py-3 px-4 text-muted-foreground">Session {intervalIndex + 1}</td>
                          <td className="py-3 px-4 text-muted-foreground">{formatTime(interval.check_in)}</td>
                          <td className="py-3 px-4 text-muted-foreground">{formatTime(interval.check_out || null)}</td>
                          <td className="py-3 px-4 text-muted-foreground">{formatHours(calculateIntervalHours(interval))}</td>
                          {intervalIndex === 0 ? (
                            <>
                              <td className="py-3 px-4 text-muted-foreground" rowSpan={record.intervals.length}>{formatHours(record.total_hours)}</td>
                              <td className="py-3 px-4" rowSpan={record.intervals.length}>
                                {getStatusBadge(record.intervals)}
                              </td>
                            </>
                          ) : null}
                        </tr>
                      ))
                    ) : (
                      <tr key={record.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 text-center text-muted-foreground">{recordIndex + 1}</td>
                        <td className="py-3 px-4 font-medium">{record.employee_name}</td>
                        <td className="py-3 px-4 text-muted-foreground">-</td>
                        <td className="py-3 px-4 text-muted-foreground">-</td>
                        <td className="py-3 px-4 text-muted-foreground">-</td>
                        <td className="py-3 px-4 text-muted-foreground">-</td>
                        <td className="py-3 px-4 text-muted-foreground">{formatHours(record.total_hours)}</td>
                        <td className="py-3 px-4">
                          {getStatusBadge(record.intervals)}
                        </td>
                      </tr>
                    )
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
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