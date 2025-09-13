import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationsViewer } from '@/components/notifications/NotificationsViewer';
import { NotificationsManagement } from '@/components/notifications/NotificationsManagement';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const Notifications = () => {
  const { employee, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading notifications...</span>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Please log in to view notifications.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {isAdmin ? (
        <NotificationsManagement />
      ) : (
        <NotificationsViewer employeeId={employee.id} />
      )}
    </div>
  );
};

export default Notifications;