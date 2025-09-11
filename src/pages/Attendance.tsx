import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { EmployeeAttendance } from "@/components/attendance/EmployeeAttendance";
import { AdminAttendance } from "@/components/attendance/AdminAttendance";

const Attendance = () => {
  const { isAdmin, isEmployee } = useAuth();

  return (
    <AppLayout>
      {isAdmin ? (
        <AdminAttendance />
      ) : isEmployee ? (
        <EmployeeAttendance />
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      )}
    </AppLayout>
  );
};

export default Attendance;