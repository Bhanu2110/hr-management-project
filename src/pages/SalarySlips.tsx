import { AppLayout } from "@/components/layout/AppLayout";

const SalarySlips = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Salary Slips</h1>
          <p className="text-muted-foreground">Generate and manage employee salary slips</p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Salary slip generation features coming soon...</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default SalarySlips;