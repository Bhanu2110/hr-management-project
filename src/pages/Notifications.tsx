import { AppLayout } from "@/components/layout/AppLayout";

const Notifications = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">View and manage system notifications</p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Notification center features coming soon...</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Notifications;