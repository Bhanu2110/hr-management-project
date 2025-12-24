import { useAuth } from '@/hooks/useAuth';
import { MetricCard } from "./MetricCard";
import { EmployeeDashboard } from "./EmployeeDashboard";
import { Users, Clock, Calendar, DollarSign, TrendingUp, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from '@/context/ThemeContext';
import { useState, useEffect } from 'react';
import { employeeService, Employee } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  intervals: any[];
  status: string;
}

interface RecentActivity {
  id: string;
  type: 'check_in' | 'leave_request';
  message: string;
  timestamp: string;
  status?: string;
}

export function DashboardOverview() {
  const { isEmployee, isAdmin } = useAuth();
  const { themeColor } = useTheme();
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [onLeave, setOnLeave] = useState(0);
  const [lateCheckIns, setLateCheckIns] = useState(0);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch Total Employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*');

      if (employeesError) {
        console.error("Error fetching total employees:", employeesError);
      } else {
        setTotalEmployees(employeesData.length);
      }

      // Fetch Attendance Data for today
      const today = new Date().toISOString().split('T')[0];
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', today);

      if (attendanceError) {
        console.error("Error fetching attendance data:", attendanceError);
      } else {
        const presentCount = attendanceData.filter(record => {
          const intervals = Array.isArray(record.intervals) ? record.intervals : [];
          return intervals.length > 0 && (intervals[0] as any)?.check_in;
        }).length;

        const lateCount = attendanceData.filter(record => {
          const intervals = Array.isArray(record.intervals) ? record.intervals : [];
          if (intervals.length > 0) {
            const firstInterval = intervals[0] as any;
            if (firstInterval?.check_in) {
              const checkInTime = new Date(firstInterval.check_in);
              const nineAM = new Date();
              nineAM.setHours(9, 0, 0, 0);
              return checkInTime > nineAM;
            }
          }
          return false;
        }).length;
        setPresentToday(presentCount);
        setLateCheckIns(lateCount);
      }

      // Fetch On Leave data
      const { data: leaveData, error: leaveError } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('status', 'approved')
        .filter('start_date', 'lte', today)
        .filter('end_date', 'gte', today);

      if (leaveError) {
        console.error("Error fetching leave data:", leaveError);
      } else {
        setOnLeave(leaveData.length);
      }

      // Fetch recent check-ins (only the latest one)
      const { data: recentCheckIns, error: checkInError } = await supabase
        .from('attendance')
        .select(`
          *,
          employee:employees!attendance_employee_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(1);

      // Fetch recent leave requests (only the latest one)
      const { data: recentLeaves, error: leaveReqError } = await supabase
        .from('leave_requests')
        .select(`
          *,
          employee:employees!leave_requests_employee_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(1);

      // Fetch pending leave requests count
      const { data: pendingLeaves, error: pendingError } = await supabase
        .from('leave_requests')
        .select('id')
        .eq('status', 'pending');

      if (pendingError) {
        console.error("Error fetching pending leave requests:", pendingError);
        setPendingLeaveCount(0);
      } else {
        const count = pendingLeaves?.length || 0;
        console.log("Pending leave requests count:", count);
        setPendingLeaveCount(count);
      }

      // Combine activities with check-in first, then leave request
      const activities: RecentActivity[] = [];

      if (recentCheckIns && !checkInError) {
        recentCheckIns.forEach((record: any) => {
          const intervals = Array.isArray(record.intervals) ? record.intervals : [];
          if (intervals.length > 0) {
            const lastInterval = intervals[intervals.length - 1];
            const checkInTime = lastInterval.check_in;
            if (checkInTime) {
              activities.push({
                id: `checkin_${record.id}`,
                type: 'check_in',
                message: `${record.employee?.first_name} ${record.employee?.last_name} checked in`,
                timestamp: checkInTime,
              });
            }
          }
        });
      }

      if (recentLeaves && !leaveReqError) {
        recentLeaves.forEach((leave: any) => {
          activities.push({
            id: `leave_${leave.id}`,
            type: 'leave_request',
            message: `Leave request from ${leave.employee?.first_name} ${leave.employee?.last_name}`,
            timestamp: leave.created_at,
            status: leave.status,
          });
        });
      }

      setRecentActivities(activities);
    };

    fetchDashboardData();
  }, []);

  const attendanceRate = totalEmployees > 0 ? ((presentToday / totalEmployees) * 100).toFixed(1) : '0';

  // Show employee-specific dashboard for employees
  if (isEmployee) {
    return <EmployeeDashboard />;
  }

  // Show admin dashboard for admins
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2 text-black" style={{ color: themeColor }}>
          Welcome to HR Management System
        </h1>
        <p className="text-black/80" style={{ color: themeColor }}>
          Manage your workforce efficiently with our comprehensive HR tools
        </p>
      </div>


      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Employees"
          value={totalEmployees.toString()}
          change="+12 this month"
          changeType="positive"
          icon={Users}
          iconColor="text-primary"
        />
        <MetricCard
          title="Present Today"
          value={presentToday.toString()}
          change={`${attendanceRate}% attendance`}
          changeType={Number(attendanceRate) < 50 ? "negative" : "positive"}
          icon={UserCheck}
          iconColor={Number(attendanceRate) < 50 ? "text-red-500" : "text-green-500"}
        />

        <MetricCard
          title="On Leave"
          value={onLeave.toString()}
          change={`${pendingLeaveCount} pending approvals`}
          changeType="warning"
          icon={Calendar}
          iconColor="text-warning"
        />
        <MetricCard
          title="Late Check-ins"
          value={lateCheckIns.toString()}
          change={`${attendanceRate}% attendance`}
          changeType={Number(attendanceRate) < 50 ? "negative" : "positive"}
          icon={Clock}
          iconColor={Number(attendanceRate) < 50 ? "text-red-500" : "text-green-500"}
        />
        <MetricCard
          title="Payroll (Monthly)"
          value="₹24.5L"
          change="+8.5% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="text-success"
        />
        <MetricCard
          title="Performance Score"
          value="4.2/5"
          change="+0.3 this quarter"
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-primary"
        />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                const getStatusColor = () => {
                  if (activity.type === 'check_in') return themeColor;
                  if (activity.status === 'pending') return '#f59e0b'; // warning
                  if (activity.status === 'approved') return '#10b981'; // success
                  if (activity.status === 'rejected') return '#ef4444'; // destructive
                  return themeColor;
                };

                const getStatusText = () => {
                  if (activity.type === 'leave_request' && activity.status) {
                    return ` - ${activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}`;
                  }
                  return '';
                };

                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div
                      className="w-2 h-2 rounded-full mt-2"
                      style={{ backgroundColor: getStatusColor() }}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {activity.message}{getStatusText()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No recent activities</p>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Pending Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingLeaveCount > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20" style={{ borderColor: themeColor, backgroundColor: `${themeColor}20` }}>
                <div>
                  <p className="text-sm font-medium">{pendingLeaveCount} Leave approval{pendingLeaveCount > 1 ? 's' : ''} pending</p>
                  <p className="text-xs text-muted-foreground">Requires your attention</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: themeColor, color: 'white' }}>Urgent</span>
              </div>
            )}
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20" style={{ borderColor: themeColor, backgroundColor: `${themeColor}20` }}>
              <div>
                <p className="text-sm font-medium">Performance reviews due</p>
                <p className="text-xs text-muted-foreground">5 employees</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: themeColor, color: 'white' }}>Due Soon</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20" style={{ borderColor: themeColor, backgroundColor: `${themeColor}20` }}>
              <div>
                <p className="text-sm font-medium">Salary slips ready</p>
                <p className="text-xs text-muted-foreground">October 2024</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: themeColor, color: 'white' }}>Ready</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}