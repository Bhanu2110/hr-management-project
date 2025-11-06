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
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;

      if (data && Array.isArray(data.intervals) && data.intervals.length > 0) {
        const intervals = data.intervals as any[];
        const lastInterval = intervals[intervals.length - 1];
        
        setAttendanceStatus({
          has_checked_in: !!(lastInterval?.check_in && !lastInterval?.check_out),
          last_check_in: lastInterval?.check_in || null,
          last_check_out: lastInterval?.check_out || null
        });
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
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toISOString();
      
      // Get today's attendance
      const { data: existingData, error: fetchError } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('date', today)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!existingData) {
        // First check-in of the day
        const { error: insertError } = await supabase
          .from('attendance')
          .insert({
            employee_id: employee.id,
            date: today,
            check_in: currentTime,
            intervals: [{ check_in: currentTime }],
            status: 'present',
            total_hours: 0
          });

        if (insertError) throw insertError;

        toast({
          title: "Checked In",
          description: "Successfully checked in for the day",
        });
      } else {
        const intervals = (existingData.intervals as any[]) || [];
        const lastInterval = intervals[intervals.length - 1];

        if (lastInterval?.check_in && !lastInterval?.check_out) {
          // Check out
          lastInterval.check_out = currentTime;
          
          // Calculate total hours
          let totalHours = 0;
          intervals.forEach((interval: any) => {
            if (interval.check_in && interval.check_out) {
              const checkIn = new Date(interval.check_in);
              const checkOut = new Date(interval.check_out);
              totalHours += (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
            }
          });

          const { error: updateError } = await supabase
            .from('attendance')
            .update({
              check_out: currentTime,
              intervals,
              total_hours: Math.round(totalHours * 100) / 100
            })
            .eq('id', existingData.id);

          if (updateError) throw updateError;

          toast({
            title: "Checked Out",
            description: "Successfully checked out",
          });
        } else {
          // New check-in after a previous check-out
          intervals.push({ check_in: currentTime });

          const { error: updateError } = await supabase
            .from('attendance')
            .update({ 
              check_in: currentTime,
              check_out: null,
              intervals 
            })
            .eq('id', existingData.id);

          if (updateError) throw updateError;

          toast({
            title: "Checked In",
            description: "Successfully checked in",
          });
        }
      }

      // Refresh attendance status
      await fetchAttendanceStatus();
    } catch (error) {
      console.error('Error handling attendance:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update attendance",
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
            ) : attendanceStatus?.last_check_out ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-semibold">Day Complete</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Checked out at {formatTime(attendanceStatus.last_check_out)}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <XCircle className="h-6 w-6" />
                  <span className="font-semibold">Not Checked In</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ready to start your day
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={handleAttendance}
            disabled={isLoading || (attendanceStatus?.last_check_out && !attendanceStatus?.has_checked_in)}
            className="w-full bg-gradient-primary hover:opacity-90 text-white disabled:opacity-50"
            size="lg"
          >
            {isLoading ? (
              "Processing..."
            ) : attendanceStatus?.last_check_out && !attendanceStatus?.has_checked_in ? (
              "Day Complete"
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