import { AppLayout } from "@/components/layout/AppLayout";

const Salary = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Salary Management</h1>
          <p className="text-muted-foreground">Manage employee salaries and compensation</p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Salary management features coming soon...</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Salary;