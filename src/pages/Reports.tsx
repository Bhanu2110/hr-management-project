import { AppLayout } from "@/components/layout/AppLayout";

const Reports = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and view HR analytics and reports</p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Reports and analytics features coming soon...</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;