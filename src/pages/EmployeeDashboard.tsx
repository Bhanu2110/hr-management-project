import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow, differenceInMinutes, isAfter, isBefore, isValid } from "date-fns";
import {
  Calendar,
  Clock,
  FileText,
  User,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  Download,
  Bell
} from "lucide-react";

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  icon: "check" | "clock" | "file" | "reject";
  timestamp: string; // ISO
}

const isValidDate = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return isValid(date);
};

const EmployeeDashboard = () => {
  const { employee } = useAuth();
  const { themeColor } = useTheme();
  const navigate = useNavigate(); // Initialize useNavigate

  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [hoursToday, setHoursToday] = useState<number>(0);
  const [attendanceStatus, setAttendanceStatus] = useState<
    "checked-in" | "checked-out" | "absent" | "on-leave"
  >("absent");

  useEffect(() => {
    const loadActivities = async () => {
      if (!employee?.id) return;

      const activities: ActivityItem[] = [];

      // Fetch latest check-in activity
      console.log("Fetching latest check-in activity for employee:", employee?.id);
      const { data: checkInData, error: checkInError } = await supabase
        .from("attendance")
        .select("id, check_in, created_at, employee_id") // Removed employees join
        .eq("employee_id", employee.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (checkInError) {
        console.error("Error fetching check-in data:", checkInError);
      }
      console.log("Check-in data:", checkInData);

      if (checkInData && checkInData.length > 0) {
        const checkIn = checkInData[0] as any;
        let checkInDate = null;

        // You might need to fetch employee details separately if the join is not working
        const { data: employeeDetails } = await supabase
          .from("employees")
          .select("first_name, last_name")
          .eq("id", checkIn.employee_id)
          .single();
        
        const employeeName = employeeDetails ? `${employeeDetails.first_name} ${employeeDetails.last_name}` : "Unknown Employee";

        if (isValidDate(checkIn.check_in)) {
          checkInDate = new Date(checkIn.check_in);
        } else if (isValidDate(checkIn.created_at)) {
          checkInDate = new Date(checkIn.created_at);
        }

        if (checkInDate) {
          activities.push({
            id: `checkin_${checkIn.id}`,
            title: `${employeeName} checked in`,
            description: `on ${format(checkInDate, "MMM d, yyyy")} at ${format(checkInDate, "p")}`,
            icon: "clock",
            timestamp: checkInDate.toISOString(),
          });
        }
      }

      // Fetch latest leave request activity
      console.log("Fetching latest leave request activity for employee:", employee?.id);
      const { data: leaveData, error: leaveError } = await supabase
        .from("leave_requests")
        .select("id, leave_type, start_date, end_date, days, status, created_at, updated_at")
        .eq("employee_id", employee.id)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (leaveError) {
        console.error("Error fetching leave data:", leaveError);
      }
      console.log("Leave data:", leaveData);

      if (leaveData && leaveData.length > 0) {
        const leave = leaveData[0] as any;
        const updatedAt = new Date(leave.updated_at || leave.created_at);
        const title = leave.status === "approved" ? "Leave request approved" : "Leave request rejected";

        // Optional period formatting if dates exist
        const range = leave.start_date && leave.end_date
          ? `${format(new Date(leave.start_date), "MMM d")}-${format(new Date(leave.end_date), "d")}`
          : `${leave.days ? `${leave.days} day(s)` : ""}`;

        activities.push({
          id: `leave_${leave.id}_${leave.status}`,
          title,
          description: leave.leave_type
            ? `Your ${leave.leave_type} ${range ? `for ${range} ` : ""}has been ${leave.status}`
            : `Your leave request has been ${leave.status}`,
          icon: leave.status === "approved" ? "check" : "reject",
          timestamp: updatedAt.toISOString(),
        });
      }

      // Sort by newest first and keep a few entries
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(activities.slice(0, 3));
      console.log("Recent Activities:", activities.slice(0, 3));

      // Calculate hours today from attendance entries
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

      const startOfDayIso = startOfDay.toISOString();
      const endOfDayIso = endOfDay.toISOString();

      console.log("Fetching today's attendance for employee:", employee?.id, "from", startOfDayIso, "to", endOfDayIso);
      const { data: todayAttendance, error: todayAttendanceError } = await supabase
        .from("attendance")
        .select("id, check_in, check_out")
        .eq("employee_id", employee.id)
        .gte("check_in", startOfDayIso.split('T')[0] + 'T00:00:00.000Z') // Compare only date part
        .lte("check_in", endOfDayIso.split('T')[0] + 'T23:59:59.999Z'); // Compare only date part

      if (todayAttendanceError) {
        console.error("Error fetching today's attendance:", todayAttendanceError);
      }
      console.log("Today's attendance data:", todayAttendance);

      let totalMinutes = 0;
      (todayAttendance || []).forEach((record: any) => {
        if (record.check_in) {
          const checkInTime = new Date(record.check_in);
          const checkOutTime = record.check_out ? new Date(record.check_out) : new Date(); // Use current time if not checked out
          totalMinutes += (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60);
        }
      });

      setHoursToday(totalMinutes / 60);
      console.log("Total minutes today:", totalMinutes, "Hours Today:", totalMinutes / 60);

      // Determine attendance status
      console.log("Determining attendance status for employee:", employee?.id);
      const { data: latestAttendance, error: latestAttendanceError } = await supabase
        .from("attendance")
        .select("check_in, check_out, created_at")
        .eq("employee_id", employee.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (latestAttendanceError) {
        console.error("Error fetching latest attendance:", latestAttendanceError);
      }
      console.log("Latest attendance data for status:", latestAttendance);

      if (latestAttendance && latestAttendance.length > 0) {
        const latest = latestAttendance[0];
        const latestCheckIn = latest.check_in
          ? new Date(latest.check_in)
          : null;
        const latestCheckOut = latest.check_out
          ? new Date(latest.check_out)
          : null;

        const now = new Date();
        const startOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        if (latestCheckIn && isAfter(latestCheckIn, startOfToday)) {
          if (latestCheckOut && isAfter(latestCheckOut, latestCheckIn)) {
            setAttendanceStatus("checked-out");
          } else {
            setAttendanceStatus("checked-in");
          }
        } else {
          // Check if the employee is on leave today
          console.log("Checking for leave today for employee:", employee?.id);
          const { data: leaveToday, error: leaveTodayError } = await supabase
            .from("leave_requests")
            .select("*")
            .eq("employee_id", employee.id)
            .eq("status", "approved")
            .lte("start_date", now.toISOString().split("T")[0])
            .gte("end_date", now.toISOString().split("T")[0]);

          if (leaveTodayError) {
            console.error("Error fetching leave today:", leaveTodayError);
          }
          console.log("Leave today data:", leaveToday);

          if (leaveToday && leaveToday.length > 0) {
            setAttendanceStatus("on-leave");
          } else {
            setAttendanceStatus("absent");
          }
        }
      }
    };

    loadActivities();

    const intervalId = setInterval(loadActivities, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [employee?.id]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
          <h1 className="text-3xl font-bold" style={{ color: themeColor }}>
            Welcome back, {employee?.first_name}!
          </h1>

            <div className="flex items-center gap-2 mt-2">
            <Badge style={{ backgroundColor: themeColor }} className="text-white">
              Employee
            </Badge>

            <span style={{ color: themeColor }}>•</span>
            <span style={{ color: themeColor }}>{employee?.department}</span>
            <span style={{ color: themeColor }}>•</span>
            <span style={{ color: themeColor }}>{employee?.position}</span>

            </div>
          </div>
          <Button 
            style={{ backgroundColor: themeColor }} 
            className="hover:bg-opacity-80 text-white"
            onClick={() => navigate("/attendance")}
          >
            <Clock className="mr-2 h-4 w-4" />
            Check In
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Leave Balance"
            value="15 days"
            icon={Calendar}
            change="+2 days added"
            changeType="positive"
          />
          <MetricCard
            title="Hours Today"
            value={hoursToday.toFixed(2)}
            icon={Clock}
            change={hoursToday >= 8 ? "+ overtime" : ""}
            changeType={hoursToday >= 8 ? "positive" : "neutral"}
          />
          <MetricCard
            title="Pending Requests"
            value="2"
            icon={AlertCircle}
            change="1 new request"
            changeType="neutral"
          />
          <MetricCard
            title="This Month"
            value="160h"
            icon={CheckCircle}
            change="+5h from last month"
            changeType="positive"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: themeColor }}>
               Leave Request
            </CardTitle>
            <CalendarDays className="h-4 w-4" style={{ color: themeColor }} />

            </CardHeader>
            <CardContent>
            <p className="text-xs mb-3" style={{ color: themeColor }}>
              Submit a new leave request
            </p>

              <Button size="sm" className="w-full text-white hover:bg-opacity-80" style={{ backgroundColor: themeColor }}
                onClick={() => navigate("/employee/leave-requests")}>
                New Request
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: themeColor }}>
              My Profile
            </CardTitle>
            <User className="h-4 w-4" style={{ color: themeColor }} />

            </CardHeader>
            <CardContent>
            <p className="text-xs mb-3" style={{ color: themeColor }}>
              Update personal information
              </p>
              <Button 
                size="sm" 
                className="w-full text-white hover:bg-opacity-80" 
                style={{ backgroundColor: themeColor }}
                onClick={() => navigate("/profile")}
              >
                View Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: themeColor }}>
              Download Payslip
            </CardTitle>
            <Download className="h-4 w-4" style={{ color: themeColor }} />

            </CardHeader>
            <CardContent>
            <p className="text-xs mb-3" style={{ color: themeColor }}>
              Get latest salary slip
              </p>
              <Button size="sm" variant="outline" className="w-full text-white hover:bg-opacity-80" style={{ backgroundColor: themeColor }}>
                Download
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-xs text-muted-foreground">No recent activity</div>
              ) : (
                recentActivities.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    {a.icon === "check" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {a.icon === "reject" && <AlertCircle className="h-4 w-4 text-red-500" />}
                    {a.icon === "clock" && <Clock className="h-4 w-4 text-blue-500" />}
                    {a.icon === "file" && <FileText className="h-4 w-4 text-purple-500" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default EmployeeDashboard;