import { AppLayout } from "@/components/layout/AppLayout";

const Documents = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground">Manage employee documents and files</p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Document management features coming soon...</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Documents;