import { useAuth } from '@/hooks/useAuth';
import { MetricCard } from "./MetricCard";
import { EmployeeDashboard } from "./EmployeeDashboard";
import { Users, Clock, Calendar, DollarSign, TrendingUp, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardOverview() {
  const { isEmployee, isAdmin } = useAuth();

  // Show employee-specific dashboard for employees
  if (isEmployee) {
    return <EmployeeDashboard />;
  }

  // Show admin dashboard for admins
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-primary rounded-lg p-6 text-white">
  <h1 className="text-2xl font-bold mb-2 text-[#E15B55]">
    Welcome to HR Management System
  </h1>
  <p className="text-[#E15B55]/80">
    Manage your workforce efficiently with our comprehensive HR tools
  </p>
</div>


      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Employees"
          value="156"
          change="+12 this month"
          changeType="positive"
          icon={Users}
          iconColor="text-primary"
        />
        <MetricCard
          title="Present Today"
          value="142"
          change="91.2% attendance"
          changeType="positive"
          icon={UserCheck}
          iconColor="text-success"
        />
        <MetricCard
          title="On Leave"
          value="8"
          change="2 pending approvals"
          changeType="neutral"
          icon={Calendar}
          iconColor="text-warning"
        />
        <MetricCard
          title="Late Check-ins"
          value="5"
          change="-3 from yesterday"
          changeType="positive"
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
              <div className="w-2 h-2 rounded-full bg-success mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">John Doe checked in</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-2 h-2 rounded-full bg-warning mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Leave request from Sarah Wilson</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
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
            <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div>
                <p className="text-sm font-medium">2 Leave approvals pending</p>
                <p className="text-xs text-muted-foreground">Requires your attention</p>
              </div>
              <span className="bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full">Urgent</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div>
                <p className="text-sm font-medium">Performance reviews due</p>
                <p className="text-xs text-muted-foreground">5 employees</p>
              </div>
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">Due Soon</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
              <div>
                <p className="text-sm font-medium">Salary slips ready</p>
                <p className="text-xs text-muted-foreground">October 2024</p>
              </div>
              <span className="bg-success text-success-foreground text-xs px-2 py-1 rounded-full">Ready</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}