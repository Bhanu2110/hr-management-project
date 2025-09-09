import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireEmployee?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireEmployee = false 
}: ProtectedRouteProps) {
  const { user, employee, loading, isAdmin, isEmployee } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-bg">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user exists but no employee record, show error
  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-bg p-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-semibold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground">
            Your account is not properly set up. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-bg p-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-semibold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page. Admin access required.
          </p>
        </div>
      </div>
    );
  }

  if (requireEmployee && !isEmployee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-bg p-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-semibold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page. Employee access required.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}