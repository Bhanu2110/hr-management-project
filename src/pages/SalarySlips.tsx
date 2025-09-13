import { useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from 'lucide-react';
import EmployeeSalarySlip from "@/components/salary/EmployeeSalarySlip";
import AdminSalaryDashboard from "@/components/salary/AdminSalaryDashboard";

const SalarySlips = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('my-slip');
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Salary Slips</h1>
            <TabsList>
              <TabsTrigger value="my-slip">My Salary Slip</TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="manage">Manage Salary Slips</TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="my-slip" className="space-y-4">
            <EmployeeSalarySlip />
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="manage">
              <AdminSalaryDashboard />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default SalarySlips;