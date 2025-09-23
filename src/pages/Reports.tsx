import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { ReportsViewer } from "@/components/reports/ReportsViewer";
import { ReportsManagement } from "@/components/reports/ReportsManagement";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Calendar, Clock, DollarSign, FileText } from "lucide-react";
import { EmployeeReport } from "@/components/reports/EmployeeReport";
import { LeaveReport } from "@/components/reports/LeaveReport";
import { AttendanceReport } from "@/components/reports/AttendanceReport";
import { PayrollReport } from "@/components/reports/PayrollReport";
import { employeeService, Employee } from '@/services/api';

const Reports = () => {
  const { user, isAdmin, employee } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const employeesData = await employeeService.getAllEmployees();
        setAllEmployees(employeesData || []);
      } catch (error) {
        console.error("Error in initial data fetch for Reports page:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading reports...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground">
                Please log in to access reports and analytics.
              </p>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {isAdmin ? (
          <div className="space-y-6">
            {/* Admin Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                <p className="text-muted-foreground">
                  Generate, manage, and analyze HR reports and analytics
                </p>
              </div>
            </div>
            <Tabs defaultValue="management">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="management" className="flex items-center gap-2"><FileText className="h-4 w-4" /> Report Management</TabsTrigger>
                <TabsTrigger value="employee-report" className="flex items-center gap-2"><Users className="h-4 w-4" /> Employee Report</TabsTrigger>
                <TabsTrigger value="leave-report" className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Leave Report</TabsTrigger>
                <TabsTrigger value="attendance-report" className="flex items-center gap-2"><Clock className="h-4 w-4" /> Attendance Report</TabsTrigger>
                <TabsTrigger value="payroll-report" className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Payroll Report</TabsTrigger>
              </TabsList>
              <TabsContent value="management">
                <ReportsManagement employees={allEmployees} />
              </TabsContent>
              <TabsContent value="employee-report">
                <EmployeeReport />
              </TabsContent>
              <TabsContent value="leave-report">
                <LeaveReport />
              </TabsContent>
              <TabsContent value="attendance-report">
                <AttendanceReport />
              </TabsContent>
              <TabsContent value="payroll-report">
                <PayrollReport />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <ReportsViewer 
            employeeId={employee?.employee_id || "EMP001"}
            userRole="employee"
            userDepartment={employee?.department || "Engineering"}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Reports;