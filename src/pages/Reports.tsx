import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { ReportsViewer } from "@/components/reports/ReportsViewer";
import { ReportsManagement } from "@/components/reports/ReportsManagement";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Reports = () => {
  const { user, isAdmin, employee } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Mock employees data for admin view
  const mockEmployees = [
    {
      id: "1",
      employee_id: "EMP001",
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@company.com",
      department: "Engineering",
      position: "Senior Developer",
    },
    {
      id: "2",
      employee_id: "EMP002",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@company.com",
      department: "HR",
      position: "HR Manager",
    },
    {
      id: "3",
      employee_id: "EMP003",
      first_name: "Mike",
      last_name: "Johnson",
      email: "mike.johnson@company.com",
      department: "Finance",
      position: "Financial Analyst",
    },
    {
      id: "4",
      employee_id: "EMP004",
      first_name: "Sarah",
      last_name: "Wilson",
      email: "sarah.wilson@company.com",
      department: "Marketing",
      position: "Marketing Specialist",
    },
    {
      id: "5",
      employee_id: "EMP005",
      first_name: "David",
      last_name: "Brown",
      email: "david.brown@company.com",
      department: "Engineering",
      position: "DevOps Engineer",
    },
  ];

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
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
                <h1 className="text-3xl font-bold">Reports Management</h1>
                <p className="text-muted-foreground">
                  Generate, manage, and analyze HR reports and analytics
                </p>
              </div>
            </div>
            <ReportsManagement employees={mockEmployees} />
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