import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { 
  Calendar, 
  Clock, 
  FileText, 
  User, 
  CheckCircle, 
  AlertCircle,
  CalendarDays,
  Download
} from "lucide-react";

const EmployeeDashboard = () => {
  const { employee } = useAuth();
  const { themeColor } = useTheme();
  const navigate = useNavigate(); // Initialize useNavigate

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
          <h1 className="text-3xl font-bold" style={{ color: themeColor }}>
            Welcome back, {employee?.first_name}!
          </h1>

            <div className="flex items-center gap-2 mt-2">
            <Badge style={{ backgroundColor: themeColor }} className="text-white">
              Employee
            </Badge>

            <span style={{ color: themeColor }}>•</span>
            <span style={{ color: themeColor }}>{employee?.department}</span>
            <span style={{ color: themeColor }}>•</span>
            <span style={{ color: themeColor }}>{employee?.position}</span>

            </div>
          </div>
          <Button style={{ backgroundColor: themeColor }} className="hover:bg-opacity-80 text-white">
            <Clock className="mr-2 h-4 w-4" />
            Clock In
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Leave Balance"
            value="15 days"
            icon={Calendar}
            change="+2 days added"
            changeType="positive"
          />
          <MetricCard
            title="Hours Today"
            value="6.5"
            icon={Clock}
            change="+0.5h overtime"
            changeType="positive"
          />
          <MetricCard
            title="Pending Requests"
            value="2"
            icon={AlertCircle}
            change="1 new request"
            changeType="neutral"
          />
          <MetricCard
            title="This Month"
            value="160h"
            icon={CheckCircle}
            change="+5h from last month"
            changeType="positive"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: themeColor }}>
              Request Leave
            </CardTitle>
            <CalendarDays className="h-4 w-4" style={{ color: themeColor }} />

            </CardHeader>
            <CardContent>
            <p className="text-xs mb-3" style={{ color: themeColor }}>
              Submit a new leave request
            </p>

              <Button size="sm" className="w-full text-white hover:bg-opacity-80" style={{ backgroundColor: themeColor }}
                onClick={() => navigate("/employee/leave-requests")}>
                New Request
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: themeColor }}>
              My Profile
            </CardTitle>
            <User className="h-4 w-4" style={{ color: themeColor }} />

            </CardHeader>
            <CardContent>
            <p className="text-xs mb-3" style={{ color: themeColor }}>
              Update personal information
              </p>
              <Button size="sm" variant="outline" className="w-full text-white hover:bg-opacity-80" style={{ backgroundColor: themeColor }}>
                View Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: themeColor }}>
              Download Payslip
            </CardTitle>
            <Download className="h-4 w-4" style={{ color: themeColor }} />

            </CardHeader>
            <CardContent>
            <p className="text-xs mb-3" style={{ color: themeColor }}>
              Get latest salary slip
              </p>
              <Button size="sm" variant="outline" className="w-full text-white hover:bg-opacity-80" style={{ backgroundColor: themeColor }}>
                Download
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Leave request approved</p>
                  <p className="text-xs text-muted-foreground">Your vacation leave for Dec 25-27 has been approved</p>
                </div>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Clocked in</p>
                  <p className="text-xs text-muted-foreground">Started work day at 9:00 AM</p>
                </div>
                <span className="text-xs text-muted-foreground">6 hours ago</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <FileText className="h-4 w-4 text-purple-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Payslip generated</p>
                  <p className="text-xs text-muted-foreground">December 2024 salary slip is now available</p>
                </div>
                <span className="text-xs text-muted-foreground">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default EmployeeDashboard;