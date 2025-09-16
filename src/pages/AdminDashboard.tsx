import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Settings, FileText, Calendar } from "lucide-react";

const AdminDashboard = () => {
  const { employee } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
          <h1 className="text-3xl font-bold text-[#E15B55]">
            Welcome back, {employee?.first_name}!
          </h1>
          <div className="flex items-center gap-2 mt-2">
  <Badge 
    variant="default" 
    className="bg-[#E15B55]/10 text-[#E15B55]"
  >
    Administrator
  </Badge>
  <span className="text-[#E15B55]">•</span>
  <span className="text-[#E15B55]">{employee?.department}</span>
</div>

          </div>
        </div>

        {/* Admin Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manage Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Add, edit, and manage employee records
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Settings</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Configure system preferences
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Generate and view detailed reports
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leave Management</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Approve and track leave requests
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