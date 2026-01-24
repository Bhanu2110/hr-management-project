import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, Calendar, User, LayoutGrid, List, ArrowUpDown } from "lucide-react";
import { LeaveApplicationForm } from "@/components/leaves/LeaveApplicationForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from '@/context/ThemeContext';
import { format, startOfMonth, endOfMonth } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  approver?: {
    first_name: string;
    last_name: string;
  };
}

type ViewMode = 'grid' | 'list';
type LeaveSortField = 'employee' | 'leave_type' | 'start_date' | 'end_date' | 'days' | 'status';
type SortDirection = 'asc' | 'desc';

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    avgDays: 0
  });
  const { employee, isAdmin, isEmployee } = useAuth();
  const { toast } = useToast();
  const { themeColor } = useTheme();
  const [sortField, setSortField] = useState<LeaveSortField>('start_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('leave_requests')
        .select(`
          *,
          employee:employees(first_name, last_name, employee_id),
          approver:admins!leave_requests_approved_by_fkey(first_name, last_name)
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

  // Format days to show "0.5 day" or "X day(s)" appropriately
  const formatDays = (days: number) => {
    if (days === 0.5) return "0.5 day (Half)";
    if (days === 1) return "1 day";
    return `${days} days`;
  };

  // Generate month options
  const months = [
    { value: "all", label: "All Months" },
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Generate year options (last 5 years to next year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => (currentYear - 5 + i).toString());

  // Filter leave requests based on month and year selection
  const filteredLeaveRequests = leaveRequests.filter((request) => {
    if (selectedMonth === "all") {
      return true;
    }

    const startDate = new Date(request.start_date);
    const endDate = new Date(request.end_date);

    // Create the selected month's start and end dates
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth) - 1; // JavaScript months are 0-indexed
    const filterMonthStart = startOfMonth(new Date(year, month));
    const filterMonthEnd = endOfMonth(new Date(year, month));

    // Check if any part of the leave request overlaps with the selected month
    return startDate <= filterMonthEnd && endDate >= filterMonthStart;
  });

  const handleSort = (field: LeaveSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedLeaveRequests = useMemo(() => {
    return [...filteredLeaveRequests].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortField) {
        case 'employee':
          aValue = `${a.employee?.first_name} ${a.employee?.last_name}`.toLowerCase();
          bValue = `${b.employee?.first_name} ${b.employee?.last_name}`.toLowerCase();
          break;
        case 'leave_type':
          aValue = a.leave_type.toLowerCase();
          bValue = b.leave_type.toLowerCase();
          break;
        case 'start_date':
          aValue = a.start_date;
          bValue = b.start_date;
          break;
        case 'end_date':
          aValue = a.end_date;
          bValue = b.end_date;
          break;
        case 'days':
          aValue = a.days;
          bValue = b.days;
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (sortDirection === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });
  }, [filteredLeaveRequests, sortField, sortDirection]);

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
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {selectedMonth !== "all" && " for the selected period"}
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
                              {request.start_date === request.end_date 
                                ? format(new Date(request.start_date), "MMM dd, yyyy")
                                : `${format(new Date(request.start_date), "MMM dd")} to ${format(new Date(request.end_date), "MMM dd, yyyy")}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Days</p>
                            <p className="font-medium">{formatDays(request.days)}</p>
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
                        {(request.status === 'approved' || request.status === 'rejected') && request.approver && (
                          <div className="mt-2">
                            <p className="text-muted-foreground text-sm">
                              {request.status === 'approved' ? 'Approved by' : 'Rejected by'}
                            </p>
                            <p className="text-sm font-medium">
                              {request.approver.first_name} {request.approver.last_name}
                            </p>
                          </div>
                        )}
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
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-muted/50">
                      <TableHead className="w-[60px] text-center font-medium">S.No</TableHead>
                      {isAdmin && (
                        <TableHead 
                          className="font-medium cursor-pointer hover:bg-muted/80"
                          onClick={() => handleSort('employee')}
                        >
                          <div className="flex items-center">
                            Employee
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </div>
                        </TableHead>
                      )}
                      <TableHead 
                        className="font-medium cursor-pointer hover:bg-muted/80"
                        onClick={() => handleSort('leave_type')}
                      >
                        <div className="flex items-center">
                          Leave Type
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="font-medium cursor-pointer hover:bg-muted/80"
                        onClick={() => handleSort('start_date')}
                      >
                        <div className="flex items-center">
                          Start Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="font-medium cursor-pointer hover:bg-muted/80"
                        onClick={() => handleSort('end_date')}
                      >
                        <div className="flex items-center">
                          End Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-center font-medium cursor-pointer hover:bg-muted/80"
                        onClick={() => handleSort('days')}
                      >
                        <div className="flex items-center justify-center">
                          Days
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-medium">Reason</TableHead>
                      <TableHead 
                        className="font-medium cursor-pointer hover:bg-muted/80"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-medium">Approved/Rejected By</TableHead>
                      {isAdmin && <TableHead className="text-center font-medium">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedLeaveRequests.map((request, index) => (
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
                        <TableCell className="text-center">{formatDays(request.days)}</TableCell>
                        <TableCell className="max-w-xs truncate" title={request.reason}>{request.reason}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {request.approver ? (
                            <span className="text-sm">
                              {request.approver.first_name} {request.approver.last_name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
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