import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AttendanceStatus {
  has_checked_in: boolean;
  last_check_in: string | null;
  last_check_out: string | null;
}

export const EmployeeAttendance = () => {
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { employee } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (employee?.id) {
      fetchAttendanceStatus();
    }
  }, [employee?.id]);

  const fetchAttendanceStatus = async () => {
    if (!employee?.id) return;

    try {
      const { data, error } = await supabase
        .rpc('get_attendance_status', { employee_uuid: employee.id });

      if (error) throw error;

      if (data && data.length > 0) {
        setAttendanceStatus(data[0]);
      } else {
        setAttendanceStatus({
          has_checked_in: false,
          last_check_in: null,
          last_check_out: null
        });
      }
    } catch (error) {
      console.error('Error fetching attendance status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance status",
        variant: "destructive",
      });
    }
  };

  const handleAttendance = async () => {
    if (!employee?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('handle_attendance', { employee_id: employee.id });

      if (error) throw error;

      if (data && typeof data === 'object' && 'error' in data) {
        throw new Error(data.message as string);
      }

      toast({
        title: "Success",
        description: data && typeof data === 'object' && 'message' in data ? data.message as string : "Attendance updated successfully",
      });

      // Refresh attendance status
      await fetchAttendanceStatus();
    } catch (error) {
      console.error('Error handling attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">My Attendance</h1>
        <p className="text-muted-foreground">{getCurrentDate()}</p>
      </div>

      {/* Check-in/out Card */}
      <Card className="shadow-card max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Clock className="h-5 w-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            {attendanceStatus?.has_checked_in ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-success">
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-semibold">Checked In</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Since {formatTime(attendanceStatus.last_check_in)}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <XCircle className="h-6 w-6" />
                  <span className="font-semibold">Not Checked In</span>
                </div>
                {attendanceStatus?.last_check_out && (
                  <p className="text-sm text-muted-foreground">
                    Last checked out at {formatTime(attendanceStatus.last_check_out)}
                  </p>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={handleAttendance}
            disabled={isLoading}
            className="w-full bg-gradient-primary hover:opacity-90 text-white"
            size="lg"
          >
            {isLoading ? (
              "Processing..."
            ) : attendanceStatus?.has_checked_in ? (
              "Check Out"
            ) : (
              "Check In"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <Card className="shadow-card max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Check In</p>
              <p className="font-semibold">{formatTime(attendanceStatus?.last_check_in)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check Out</p>
              <p className="font-semibold">{formatTime(attendanceStatus?.last_check_out)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};