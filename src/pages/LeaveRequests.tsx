import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, X, Clock } from "lucide-react";

const leaveRequests = [
  {
    id: 1,
    employee: "John Doe",
    type: "Annual Leave",
    startDate: "2024-01-20",
    endDate: "2024-01-25",
    days: 5,
    reason: "Family vacation",
    status: "Pending",
    appliedDate: "2024-01-15"
  },
  {
    id: 2,
    employee: "Sarah Wilson",
    type: "Sick Leave",
    startDate: "2024-01-18",
    endDate: "2024-01-19",
    days: 2,
    reason: "Medical appointment",
    status: "Approved",
    appliedDate: "2024-01-17"
  },
  {
    id: 3,
    employee: "Mike Johnson",
    type: "Personal Leave",
    startDate: "2024-01-22",
    endDate: "2024-01-22",
    days: 1,
    reason: "Personal work",
    status: "Rejected",
    appliedDate: "2024-01-16"
  }
];

const LeaveRequests = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "Pending":
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
            <h1 className="text-2xl font-bold text-foreground">Leave Requests</h1>
            <p className="text-muted-foreground">Manage employee leave applications and approvals</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Leave Request
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approval</p>
                  <p className="text-xl font-bold text-foreground">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Check className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved This Month</p>
                  <p className="text-xl font-bold text-foreground">18</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Days/Request</p>
                  <p className="text-xl font-bold text-foreground">2.8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leave Requests Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div key={request.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{request.employee}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Leave Type</p>
                          <p className="font-medium">{request.type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">{request.startDate} to {request.endDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Days</p>
                          <p className="font-medium">{request.days} day(s)</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Applied Date</p>
                          <p className="font-medium">{request.appliedDate}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-muted-foreground text-sm">Reason</p>
                        <p className="text-sm">{request.reason}</p>
                      </div>
                    </div>
                    
                    {request.status === "Pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground">
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default LeaveRequests;