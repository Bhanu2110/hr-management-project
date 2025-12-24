import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Settings, FileText, Calendar, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { employee } = useAuth();
  const { themeColor } = useTheme();
  const navigate = useNavigate();

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
              <Badge
                variant="default"
                style={{ backgroundColor: `${themeColor}20`, color: themeColor === '#E15B55' ? 'black' : 'white' }}
              >
                Administrator
              </Badge>
              <span style={{ color: themeColor }}>•</span>
              <span style={{ color: themeColor }}>{employee?.department}</span>
            </div>

          </div>
        </div>

        {/* Admin Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/employees')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: themeColor }}>Manage Employees</CardTitle>
              <Users className="h-4 w-4" style={{ color: themeColor }} />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Add, edit, and manage employee records
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: themeColor }}>System Settings</CardTitle>
              <Settings className="h-4 w-4" style={{ color: themeColor }} />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Configure system preferences
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/reports')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: themeColor }}>Reports</CardTitle>
              <FileText className="h-4 w-4" style={{ color: themeColor }} />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Generate and view detailed reports
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/leave-requests')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: themeColor }}>Leave Management</CardTitle>
              <Calendar className="h-4 w-4" style={{ color: themeColor }} />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Approve and track leave requests
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/admin/holidays')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: themeColor }}>Manage Holidays</CardTitle>
              <CalendarDays className="h-4 w-4" style={{ color: themeColor }} />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Add, edit, and manage holidays
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Overview */}
        <DashboardOverview />
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;