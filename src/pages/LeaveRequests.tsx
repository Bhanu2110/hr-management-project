import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, X, Clock, Calendar, User } from "lucide-react";
import { LeaveApplicationForm } from "@/components/leaves/LeaveApplicationForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    avgDays: 0
  });
  const { employee, isAdmin, isEmployee } = useAuth();
  const { toast } = useToast();

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
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
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
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
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
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Check className="h-5 w-5 text-success" />
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
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Days/Request</p>
                  <p className="text-xl font-bold text-foreground">{stats.avgDays.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leave Requests Table */}
        <Card className="shadow-[--shadow-card]">
          <CardHeader>
            <CardTitle>
              {isEmployee ? "My Leave Requests" : "Recent Leave Requests"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading leave requests...</div>
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {isEmployee ? "You haven't applied for any leaves yet" : "No leave requests found"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {leaveRequests.map((request) => (
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
                            className="bg-success hover:bg-success/90 text-success-foreground"
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
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default LeaveRequests;