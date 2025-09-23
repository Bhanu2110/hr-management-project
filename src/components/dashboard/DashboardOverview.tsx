import { useAuth } from '@/hooks/useAuth';
import { MetricCard } from "./MetricCard";
import { EmployeeDashboard } from "./EmployeeDashboard";
import { Users, Clock, Calendar, DollarSign, TrendingUp, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from '@/context/ThemeContext';
import { useState, useEffect } from 'react';
import { employeeService, Employee } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  check_in: string;
  check_out: string | null;
  status: string;
}

export function DashboardOverview() {
  const { isEmployee, isAdmin } = useAuth();
  const { themeColor } = useTheme();
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [onLeave, setOnLeave] = useState(0);
  const [lateCheckIns, setLateCheckIns] = useState(0);

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
        .gte('check_in', `${today}T00:00:00.000Z`)
        .lte('check_in', `${today}T23:59:59.999Z`);
      
      if (attendanceError) {
        console.error("Error fetching attendance data:", attendanceError);
      } else {
        const presentCount = attendanceData.filter(record => record.status === 'checked_in' || record.status === 'checked_out').length;
        const lateCount = attendanceData.filter(record => {
          if (record.check_in) {
            const checkInTime = new Date(record.check_in);
            const nineAM = new Date();
            nineAM.setHours(9, 0, 0, 0);
            return checkInTime > nineAM;
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

    };

    fetchDashboardData();
  }, []);

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
          change="91.2% attendance"
          changeType="positive"
          icon={UserCheck}
          iconColor="text-success"
        />
        <MetricCard
          title="On Leave"
          value={onLeave.toString()}
          change="2 pending approvals"
          changeType="neutral"
          icon={Calendar}
          iconColor="text-warning"
        />
        <MetricCard
          title="Late Check-ins"
          value={lateCheckIns.toString()}
          change="-3 from yesterday"
          changeType="negative"
          icon={Clock}
          iconColor="text-destructive"
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
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-2 h-2 rounded-full bg-success mt-2" style={{ backgroundColor: themeColor }}></div>
              <div className="flex-1">
                <p className="text-sm font-medium">John Doe checked in</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-2 h-2 rounded-full bg-warning mt-2" style={{ backgroundColor: themeColor }}></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Leave request from Sarah Wilson</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" style={{ backgroundColor: themeColor }}></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Monthly payroll generated</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Pending Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20" style={{ borderColor: themeColor, backgroundColor: `${themeColor}20` }}>
              <div>
                <p className="text-sm font-medium">2 Leave approvals pending</p>
                <p className="text-xs text-muted-foreground">Requires your attention</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: themeColor, color: 'white' }}>Urgent</span>
            </div>
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