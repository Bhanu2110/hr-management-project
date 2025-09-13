import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Search, 
  Download, 
  Eye, 
  Filter,
  FileText,
  Clock,
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  Building,
  Shield,
  Settings,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { 
  Report, 
  ReportType, 
  REPORT_TYPES, 
  REPORT_STATUS_COLORS,
  REPORT_FORMAT_OPTIONS,
  formatFileSize,
  formatDateRange,
  getReportTypeIcon,
  canAccessReport
} from "@/types/reports";

interface ReportsViewerProps {
  employeeId?: string;
  userRole?: 'admin' | 'hr' | 'manager' | 'employee';
  userDepartment?: string;
}

export function ReportsViewer({ 
  employeeId, 
  userRole = 'employee',
  userDepartment 
}: ReportsViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState("available");

  // Mock reports data for employee view
  const mockReports: Report[] = [
    {
      id: "1",
      title: "My Attendance Report - November 2024",
      description: "Personal attendance summary for November 2024",
      type: "attendance",
      format: "pdf",
      status: "completed",
      parameters: {
        date_range: {
          start_date: "2024-11-01T00:00:00Z",
          end_date: "2024-11-30T23:59:59Z"
        },
        employee_ids: [employeeId || "EMP001"],
        attendance_params: {
          include_overtime: true,
          include_breaks: true,
          group_by: "date",
          show_summary: true,
          include_late_arrivals: true,
          include_early_departures: true
        }
      },
      visibility: "private",
      accessible_roles: ["employee"],
      accessible_departments: [],
      accessible_employees: [employeeId || "EMP001"],
      file_url: "/reports/attendance_november_2024.pdf",
      file_size: 245760,
      generated_by: "system",
      generated_by_name: "System Generated",
      generated_date: "2024-12-01T10:00:00Z",
      download_count: 3,
      last_downloaded: "2024-12-05T14:30:00Z",
      created_at: "2024-12-01T10:00:00Z",
      updated_at: "2024-12-01T10:00:00Z",
    },
    {
      id: "2",
      title: "Leave Balance Report - 2024",
      description: "Annual leave balance and usage summary",
      type: "leave",
      format: "excel",
      status: "completed",
      parameters: {
        date_range: {
          start_date: "2024-01-01T00:00:00Z",
          end_date: "2024-12-31T23:59:59Z"
        },
        employee_ids: [employeeId || "EMP001"],
        leave_params: {
          leave_types: ["annual", "sick", "casual"],
          include_pending: true,
          include_approved: true,
          include_rejected: false,
          group_by: "leave_type",
          show_balance: true
        }
      },
      visibility: "private",
      accessible_roles: ["employee"],
      accessible_departments: [],
      accessible_employees: [employeeId || "EMP001"],
      file_url: "/reports/leave_balance_2024.xlsx",
      file_size: 89456,
      generated_by: "hr_admin",
      generated_by_name: "HR Admin",
      generated_date: "2024-11-25T15:00:00Z",
      download_count: 1,
      created_at: "2024-11-25T15:00:00Z",
      updated_at: "2024-11-25T15:00:00Z",
    },
    {
      id: "3",
      title: "Department Performance Summary - Q4 2024",
      description: "Engineering department performance metrics for Q4",
      type: "department",
      format: "pdf",
      status: "completed",
      parameters: {
        date_range: {
          start_date: "2024-10-01T00:00:00Z",
          end_date: "2024-12-31T23:59:59Z"
        },
        department_ids: ["engineering"],
        department_params: {
          include_headcount: true,
          include_budget: false,
          include_performance_metrics: true,
          include_turnover_rate: true,
          compare_periods: true
        }
      },
      visibility: "department",
      accessible_roles: ["employee", "manager"],
      accessible_departments: ["Engineering"],
      accessible_employees: [],
      file_url: "/reports/dept_performance_q4_2024.pdf",
      file_size: 567890,
      generated_by: "manager",
      generated_by_name: "Engineering Manager",
      generated_date: "2024-12-10T09:00:00Z",
      download_count: 12,
      last_downloaded: "2024-12-12T11:20:00Z",
      created_at: "2024-12-10T09:00:00Z",
      updated_at: "2024-12-10T09:00:00Z",
    },
    {
      id: "4",
      title: "Company Attendance Overview - November 2024",
      description: "Company-wide attendance statistics and trends",
      type: "attendance",
      format: "pdf",
      status: "completed",
      parameters: {
        date_range: {
          start_date: "2024-11-01T00:00:00Z",
          end_date: "2024-11-30T23:59:59Z"
        },
        attendance_params: {
          include_overtime: true,
          include_breaks: false,
          group_by: "department",
          show_summary: true,
          include_late_arrivals: true,
          include_early_departures: true
        }
      },
      visibility: "public",
      accessible_roles: ["employee", "manager", "admin"],
      accessible_departments: [],
      accessible_employees: [],
      file_url: "/reports/company_attendance_november_2024.pdf",
      file_size: 1234567,
      generated_by: "hr_admin",
      generated_by_name: "HR Admin",
      generated_date: "2024-12-01T16:00:00Z",
      download_count: 45,
      last_downloaded: "2024-12-12T16:45:00Z",
      created_at: "2024-12-01T16:00:00Z",
      updated_at: "2024-12-01T16:00:00Z",
    },
    {
      id: "5",
      title: "Training Completion Report - 2024",
      description: "Employee training completion status and certifications",
      type: "compliance",
      format: "excel",
      status: "generating",
      parameters: {
        date_range: {
          start_date: "2024-01-01T00:00:00Z",
          end_date: "2024-12-31T23:59:59Z"
        },
        compliance_params: {
          compliance_types: ["training", "certification"],
          include_violations: false,
          include_training_status: true,
          include_certifications: true,
          risk_level: "all"
        }
      },
      visibility: "public",
      accessible_roles: ["employee", "manager", "admin"],
      accessible_departments: [],
      accessible_employees: [],
      generated_by: "training_admin",
      generated_by_name: "Training Admin",
      download_count: 0,
      created_at: "2024-12-12T10:00:00Z",
      updated_at: "2024-12-12T10:00:00Z",
    },
  ];

  // Filter reports based on user access and search criteria
  const filteredReports = mockReports.filter((report) => {
    // Check access permissions
    if (!canAccessReport(report, userRole, userDepartment, employeeId)) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        report.title.toLowerCase().includes(searchLower) ||
        report.description?.toLowerCase().includes(searchLower) ||
        report.type.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) {
        return false;
      }
    }

    // Filter by type
    if (selectedType !== "all" && report.type !== selectedType) {
      return false;
    }

    // Filter by status
    if (selectedStatus !== "all" && report.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  // Separate reports by status for tabs
  const availableReports = filteredReports.filter(r => r.status === 'completed');
  const generatingReports = filteredReports.filter(r => r.status === 'generating');
  const scheduledReports = filteredReports.filter(r => r.status === 'scheduled');

  const getIconComponent = (type: ReportType) => {
    const iconName = getReportTypeIcon(type);
    const iconMap: Record<string, any> = {
      Clock,
      DollarSign,
      Calendar,
      TrendingUp,
      Users,
      Building,
      Shield,
      Settings,
      FileText,
    };
    return iconMap[iconName] || FileText;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = (report: Report) => {
    console.log("Downloading report:", report.title);
    // Mock download functionality
  };

  const handleView = (report: Report) => {
    setSelectedReport(report);
  };

  const handleRefresh = () => {
    console.log("Refreshing reports...");
    // Mock refresh functionality
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Access and download your reports and analytics
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports by title, description, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(REPORT_TYPES).map(([key, type]) => (
                  <SelectItem key={key} value={key}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="generating">Generating</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">
            Available ({availableReports.length})
          </TabsTrigger>
          <TabsTrigger value="generating">
            Generating ({generatingReports.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled ({scheduledReports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {availableReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableReports.map((report) => {
                const IconComponent = getIconComponent(report.type);
                return (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{report.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {REPORT_TYPES[report.type]?.name}
                          </p>
                        </div>
                        <Badge className={REPORT_STATUS_COLORS[report.status]}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {report.description}
                      </p>

                      <div className="space-y-2 text-xs text-muted-foreground mb-4">
                        <div className="flex justify-between">
                          <span>Generated:</span>
                          <span>{report.generated_date ? formatDate(report.generated_date) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{report.file_size ? formatFileSize(report.file_size) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Format:</span>
                          <span>{report.format.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Downloads:</span>
                          <span>{report.download_count}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 gap-2"
                          onClick={() => handleView(report)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => handleDownload(report)}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reports Available</h3>
                <p className="text-muted-foreground">
                  No completed reports match your current filters. Try adjusting your search criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="generating" className="space-y-4">
          {generatingReports.length > 0 ? (
            <div className="space-y-4">
              {generatingReports.map((report) => {
                const IconComponent = getIconComponent(report.type);
                return (
                  <Card key={report.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{report.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {REPORT_TYPES[report.type]?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                          <Badge className={REPORT_STATUS_COLORS[report.status]}>
                            Generating...
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reports Generating</h3>
                <p className="text-muted-foreground">
                  There are currently no reports being generated.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {scheduledReports.length > 0 ? (
            <div className="space-y-4">
              {scheduledReports.map((report) => {
                const IconComponent = getIconComponent(report.type);
                return (
                  <Card key={report.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <IconComponent className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{report.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {REPORT_TYPES[report.type]?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <Badge className={REPORT_STATUS_COLORS[report.status]}>
                            Scheduled
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Scheduled Reports</h3>
                <p className="text-muted-foreground">
                  There are currently no scheduled reports.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Report Preview Modal */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {(() => {
                  const IconComponent = getIconComponent(selectedReport.type);
                  return <IconComponent className="h-5 w-5" />;
                })()}
                {selectedReport.title}
              </DialogTitle>
              <DialogDescription>
                {selectedReport.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Report Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{REPORT_TYPES[selectedReport.type]?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Format:</span>
                      <span>{selectedReport.format.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={REPORT_STATUS_COLORS[selectedReport.status]}>
                        {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{selectedReport.file_size ? formatFileSize(selectedReport.file_size) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Generation Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Generated By:</span>
                      <span>{selectedReport.generated_by_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Generated:</span>
                      <span>{selectedReport.generated_date ? formatDate(selectedReport.generated_date) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Downloads:</span>
                      <span>{selectedReport.download_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Downloaded:</span>
                      <span>{selectedReport.last_downloaded ? formatDate(selectedReport.last_downloaded) : 'Never'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Date Range</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDateRange(
                    selectedReport.parameters.date_range.start_date,
                    selectedReport.parameters.date_range.end_date
                  )}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1 gap-2"
                  onClick={() => handleDownload(selectedReport)}
                  disabled={selectedReport.status !== 'completed'}
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedReport(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
