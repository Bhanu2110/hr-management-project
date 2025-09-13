import { useAuth } from '@/hooks/useAuth';
import { MetricCard } from "./MetricCard";
import { Form16Download } from "@/components/form16/Form16Download";
import { FileText, Calendar, Clock, User, Download, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function EmployeeDashboard() {
  const { employee } = useAuth();

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Loading employee information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-primary rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {employee.first_name}!
        </h1>
        <p className="text-white/80">
          Employee ID: {employee.employee_id} • Department: {employee.department}
        </p>
      </div>

      {/* Employee Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Attendance This Month"
          value="22/23"
          change="95.7% attendance"
          changeType="positive"
          icon={CheckCircle}
          iconColor="text-success"
        />
        <MetricCard
          title="Leave Balance"
          value="18 days"
          change="6 days used"
          changeType="neutral"
          icon={Calendar}
          iconColor="text-primary"
        />
        <MetricCard
          title="Pending Tasks"
          value="3"
          change="2 due today"
          changeType="neutral"
          icon={Clock}
          iconColor="text-warning"
        />
        <MetricCard
          title="Profile Status"
          value="Complete"
          change="100% updated"
          changeType="positive"
          icon={User}
          iconColor="text-success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form 16 Downloads */}
        <div className="lg:col-span-2">
          <Form16Download />
        </div>

        {/* Recent Activities */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-2 h-2 rounded-full bg-success mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Checked in at 9:15 AM</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Leave application approved</p>
                <p className="text-xs text-muted-foreground">2 days ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-2 h-2 rounded-full bg-warning mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Profile updated</p>
                <p className="text-xs text-muted-foreground">1 week ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Calendar className="h-4 w-4" />
              Apply for Leave
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" />
              View Salary Slip
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <User className="h-4 w-4" />
              Update Profile
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Clock className="h-4 w-4" />
              View Attendance
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Employee Information */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">My Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="text-sm">{employee.first_name} {employee.last_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
              <p className="text-sm">{employee.employee_id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{employee.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Department</p>
              <p className="text-sm">{employee.department}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Position</p>
              <p className="text-sm">{employee.position}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant="secondary" className="capitalize">
                {employee.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
