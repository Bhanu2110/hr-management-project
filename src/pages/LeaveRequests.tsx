import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, Calendar, User, LayoutGrid, List } from "lucide-react";
import { LeaveApplicationForm } from "@/components/leaves/LeaveApplicationForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from '@/context/ThemeContext';
import { format, isSameMonth, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
  admin_notes?: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_id: string;
  };
}

type ViewMode = 'grid' | 'list';

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isMonthFiltered, setIsMonthFiltered] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    avgDays: 0
  });
  const { employee, isAdmin, isEmployee } = useAuth();
  const { toast } = useToast();
  const { themeColor } = useTheme();

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('leave_requests')
        .select(`
          *,
          employee:employees(first_name, last_name, employee_id)
        `)
        .order('created_at', { ascending: false });

      // If employee, only fetch their own requests
      if (isEmployee) {
        query = query.eq('employee_id', employee?.id);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setLeaveRequests(data || []);

      // Calculate stats
      const pending = data?.filter(req => req.status === 'pending').length || 0;
      const approved = data?.filter(req => req.status === 'approved').length || 0;
      const totalDays = data?.reduce((sum, req) => sum + req.days, 0) || 0;
      const avgDays = data?.length ? (totalDays / data.length) : 0;

      setStats({ pending, approved, avgDays });
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leave requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employee) {
      fetchLeaveRequests();
    }
  }, [employee, isAdmin, isEmployee]);

  // Filter leave requests based on date selection
  const filteredLeaveRequests = leaveRequests.filter((request) => {
    const startDate = new Date(request.start_date);
    const endDate = new Date(request.end_date);

    if (selectedDate) {
      // Check if selected date falls within the leave request's date range
      return selectedDate >= startDate && selectedDate <= endDate;
    }

    if (isMonthFiltered && currentMonth) {
      // Check if any part of the leave request overlaps with the selected month
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      return startDate <= monthEnd && endDate >= monthStart;
    }

    return true;
  });

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
    setIsMonthFiltered(true);
    setSelectedDate(undefined);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setIsMonthFiltered(false);
  };

  const handleApproveReject = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status,
          approved_by: employee?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Leave request ${status} successfully`,
      });

      fetchLeaveRequests();
    } catch (error) {
      console.error('Error updating leave request:', error);
      toast({
        title: "Error",
        description: "Failed to update leave request",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success text-success-foreground" style={{ backgroundColor: themeColor }}>Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground" style={{ backgroundColor: themeColor }}>Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEmployee ? "My Leave Requests" : "Leave Requests"}
            </h1>
            <p className="text-muted-foreground">
              {isEmployee
                ? "View and manage your leave applications"
                : "Manage employee leave applications and approvals"
              }
            </p>
          </div>
          {isEmployee && (
            <LeaveApplicationForm onLeaveSubmitted={fetchLeaveRequests} />
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-[--shadow-card]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: themeColor ? `${themeColor}1A` : '' }}>
                  <Clock className="h-5 w-5 text-warning" style={{ color: themeColor }} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isEmployee ? "Pending Requests" : "Pending Approval"}
                  </p>
                  <p className="text-xl font-bold text-foreground">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[--shadow-card]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: themeColor ? `${themeColor}1A` : '' }}>
                  <Check className="h-5 w-5 text-success" style={{ color: themeColor }} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isEmployee ? "Approved Requests" : "Approved This Month"}
                  </p>
                  <p className="text-xl font-bold text-foreground">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[--shadow-card]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: themeColor ? `${themeColor}1A` : '' }}>
                  <Calendar className="h-5 w-5 text-primary" style={{ color: themeColor }} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Days/Request</p>
                  <p className="text-xl font-bold text-foreground">{stats.avgDays.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leave Requests */}
        <Card className="shadow-[--shadow-card]">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>
                {isEmployee ? "My Leave Requests" : "Recent Leave Requests"}
              </CardTitle>
              <div className="flex flex-wrap gap-2 items-center">
                <DatePicker
                  date={selectedDate}
                  setDate={handleDateSelect}
                  month={currentMonth}
                  onMonthChange={handleMonthChange}
                  isMonthFiltered={isMonthFiltered}
                  className="w-[200px]"
                />
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  style={viewMode === 'grid' ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
                  className={viewMode === 'grid' ? 'text-white' : ''}
                >
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  style={viewMode === 'list' ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
                  className={viewMode === 'list' ? 'text-white' : ''}
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading leave requests...</div>
              </div>
            ) : filteredLeaveRequests.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {isEmployee ? "You haven't applied for any leaves yet" : "No leave requests found"}
                    {(selectedDate || isMonthFiltered) && " for the selected period"}
                  </p>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="space-y-4">
                {filteredLeaveRequests.map((request) => (
                  <div key={request.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {isAdmin && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <h3 className="font-semibold text-foreground">
                                {request.employee?.first_name} {request.employee?.last_name}
                              </h3>
                              <span className="text-sm text-muted-foreground">
                                ({request.employee?.employee_id})
                              </span>
                            </div>
                          )}
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Leave Type</p>
                            <p className="font-medium">{request.leave_type}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-medium">
                              {format(new Date(request.start_date), "MMM dd")} to {format(new Date(request.end_date), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Days</p>
                            <p className="font-medium">{request.days} day(s)</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Applied Date</p>
                            <p className="font-medium">{format(new Date(request.created_at), "MMM dd, yyyy")}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-muted-foreground text-sm">Reason</p>
                          <p className="text-sm">{request.reason}</p>
                        </div>
                      </div>

                      {isAdmin && request.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="text-success-foreground"
                            style={{ backgroundColor: themeColor }}
                            onClick={() => handleApproveReject(request.id, 'approved')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApproveReject(request.id, 'rejected')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px] text-center">S.No</TableHead>
                      {isAdmin && <TableHead>Employee</TableHead>}
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead className="text-center">Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && <TableHead className="text-center">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeaveRequests.map((request, index) => (
                      <TableRow key={request.id}>
                        <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                        {isAdmin && (
                          <TableCell className="font-medium">
                            <div>
                              <div>{request.employee?.first_name} {request.employee?.last_name}</div>
                              <div className="text-xs text-muted-foreground">({request.employee?.employee_id})</div>
                            </div>
                          </TableCell>
                        )}
                        <TableCell>{request.leave_type}</TableCell>
                        <TableCell>{format(new Date(request.start_date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{format(new Date(request.end_date), "MMM dd, yyyy")}</TableCell>
                        <TableCell className="text-center">{request.days}</TableCell>
                        <TableCell className="max-w-xs truncate" title={request.reason}>{request.reason}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        {isAdmin && (
                          <TableCell>
                            {request.status === "pending" ? (
                              <div className="flex gap-1 justify-center">
                                <Button
                                  size="sm"
                                  className="text-white h-8"
                                  style={{ backgroundColor: themeColor }}
                                  onClick={() => handleApproveReject(request.id, 'approved')}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8"
                                  onClick={() => handleApproveReject(request.id, 'rejected')}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center text-muted-foreground text-sm">-</div>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default LeaveRequests;