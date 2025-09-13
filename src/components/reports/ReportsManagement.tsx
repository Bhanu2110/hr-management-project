import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Eye,
  Trash2,
  Play,
  Pause,
  Calendar,
  FileText,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Building,
  Shield,
  Settings,
  BarChart3,
  RefreshCw,
  Send,
  CheckCircle,
  XCircle
} from "lucide-react";
import { 
  Report, 
  ReportType,
  ReportFormat,
  ReportFrequency,
  ReportGenerationRequest,
  REPORT_TYPES, 
  REPORT_STATUS_COLORS,
  REPORT_FORMAT_OPTIONS,
  FREQUENCY_OPTIONS,
  VISIBILITY_OPTIONS,
  formatFileSize,
  formatDateRange,
  getReportTypeIcon
} from "@/types/reports";

interface ReportsManagementProps {
  employees?: Array<{
    id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    department: string;
    position: string;
  }>;
}

export function ReportsManagement({ employees = [] }: ReportsManagementProps) {
  const [activeTab, setActiveTab] = useState("all-reports");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportData, setReportData] = useState<Partial<ReportGenerationRequest>>({
    title: "",
    description: "",
    type: "attendance",
    format: "pdf",
    parameters: {
      date_range: {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date().toISOString()
      }
    },
    visibility: "role_based",
    accessible_roles: ["admin"],
  });

  // Mock reports data for admin view
  const mockReports: Report[] = [
    {
      id: "1",
      title: "Monthly Payroll Report - November 2024",
      description: "Complete payroll summary for all employees in November 2024",
      type: "payroll",
      format: "excel",
      status: "completed",
      parameters: {
        date_range: {
          start_date: "2024-11-01T00:00:00Z",
          end_date: "2024-11-30T23:59:59Z"
        },
        payroll_params: {
          include_deductions: true,
          include_benefits: true,
          include_tax_details: true,
          group_by: "department",
          show_year_to_date: true,
          currency_format: "INR"
        }
      },
      frequency: "monthly",
      scheduled_date: "2024-12-01T09:00:00Z",
      next_run_date: "2025-01-01T09:00:00Z",
      visibility: "role_based",
      accessible_roles: ["admin", "hr"],
      accessible_departments: [],
      accessible_employees: [],
      file_url: "/reports/payroll_november_2024.xlsx",
      file_size: 2456789,
      generated_by: "admin",
      generated_by_name: "System Admin",
      generated_date: "2024-12-01T09:15:00Z",
      download_count: 8,
      last_downloaded: "2024-12-10T14:30:00Z",
      created_at: "2024-11-25T10:00:00Z",
      updated_at: "2024-12-01T09:15:00Z",
    },
    {
      id: "2",
      title: "Employee Performance Analysis - Q4 2024",
      description: "Quarterly performance review analysis for all departments",
      type: "performance",
      format: "pdf",
      status: "completed",
      parameters: {
        date_range: {
          start_date: "2024-10-01T00:00:00Z",
          end_date: "2024-12-31T23:59:59Z"
        },
        performance_params: {
          review_periods: ["Q4-2024"],
          include_goals: true,
          include_ratings: true,
          include_feedback: true,
          group_by: "department"
        }
      },
      visibility: "role_based",
      accessible_roles: ["admin", "hr", "manager"],
      accessible_departments: [],
      accessible_employees: [],
      file_url: "/reports/performance_q4_2024.pdf",
      file_size: 1234567,
      generated_by: "hr_admin",
      generated_by_name: "HR Admin",
      generated_date: "2024-12-05T16:00:00Z",
      download_count: 15,
      last_downloaded: "2024-12-12T11:20:00Z",
      created_at: "2024-12-01T10:00:00Z",
      updated_at: "2024-12-05T16:00:00Z",
    },
    {
      id: "3",
      title: "Attendance Summary - All Departments",
      description: "Company-wide attendance report with overtime and leave analysis",
      type: "attendance",
      format: "pdf",
      status: "generating",
      parameters: {
        date_range: {
          start_date: "2024-12-01T00:00:00Z",
          end_date: "2024-12-31T23:59:59Z"
        },
        attendance_params: {
          include_overtime: true,
          include_breaks: true,
          group_by: "department",
          show_summary: true,
          include_late_arrivals: true,
          include_early_departures: true
        }
      },
      visibility: "public",
      accessible_roles: ["admin", "hr", "manager", "employee"],
      accessible_departments: [],
      accessible_employees: [],
      generated_by: "system",
      generated_by_name: "System Generated",
      download_count: 0,
      created_at: "2024-12-12T10:00:00Z",
      updated_at: "2024-12-12T10:00:00Z",
    },
    {
      id: "4",
      title: "Compliance Training Report - 2024",
      description: "Annual compliance training completion and certification status",
      type: "compliance",
      format: "excel",
      status: "scheduled",
      parameters: {
        date_range: {
          start_date: "2024-01-01T00:00:00Z",
          end_date: "2024-12-31T23:59:59Z"
        },
        compliance_params: {
          compliance_types: ["training", "certification", "safety"],
          include_violations: true,
          include_training_status: true,
          include_certifications: true,
          risk_level: "all"
        }
      },
      frequency: "yearly",
      scheduled_date: "2024-12-31T23:59:00Z",
      visibility: "role_based",
      accessible_roles: ["admin", "hr"],
      accessible_departments: [],
      accessible_employees: [],
      generated_by: "compliance_admin",
      generated_by_name: "Compliance Admin",
      download_count: 0,
      created_at: "2024-12-01T15:00:00Z",
      updated_at: "2024-12-01T15:00:00Z",
    },
    {
      id: "5",
      title: "Department Headcount Analysis",
      description: "Department-wise employee distribution and growth analysis",
      type: "department",
      format: "pdf",
      status: "failed",
      parameters: {
        date_range: {
          start_date: "2024-01-01T00:00:00Z",
          end_date: "2024-12-31T23:59:59Z"
        },
        department_params: {
          include_headcount: true,
          include_budget: true,
          include_performance_metrics: true,
          include_turnover_rate: true,
          compare_periods: true
        }
      },
      visibility: "role_based",
      accessible_roles: ["admin"],
      accessible_departments: [],
      accessible_employees: [],
      generated_by: "admin",
      generated_by_name: "System Admin",
      download_count: 0,
      created_at: "2024-12-10T14:00:00Z",
      updated_at: "2024-12-10T14:30:00Z",
    },
  ];

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || report.type === filterType;
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

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

  const handleCreateReport = () => {
    console.log("Creating report with data:", reportData);
    setIsCreateDialogOpen(false);
    setReportData({
      title: "",
      description: "",
      type: "attendance",
      format: "pdf",
      parameters: {
        date_range: {
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString()
        }
      },
      visibility: "role_based",
      accessible_roles: ["admin"],
    });
  };

  const handleDownload = (report: Report) => {
    console.log("Downloading report:", report.title);
  };

  const handleEdit = (report: Report) => {
    console.log("Editing report:", report.id);
  };

  const handleDelete = (report: Report) => {
    console.log("Deleting report:", report.id);
  };

  const handleRunNow = (report: Report) => {
    console.log("Running report now:", report.id);
  };

  const handlePauseSchedule = (report: Report) => {
    console.log("Pausing schedule for report:", report.id);
  };

  // Calculate statistics
  const stats = {
    total: mockReports.length,
    completed: mockReports.filter(r => r.status === 'completed').length,
    generating: mockReports.filter(r => r.status === 'generating').length,
    scheduled: mockReports.filter(r => r.status === 'scheduled').length,
    failed: mockReports.filter(r => r.status === 'failed').length,
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center justify-end">
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generate New Report</DialogTitle>
                <DialogDescription>
                  Create a new report with custom parameters and scheduling options
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Report Title</Label>
                    <Input
                      id="title"
                      value={reportData.title}
                      onChange={(e) => setReportData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter report title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Report Type</Label>
                    <Select 
                      value={reportData.type} 
                      onValueChange={(value) => setReportData(prev => ({ ...prev, type: value as ReportType }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(REPORT_TYPES).map(([key, type]) => (
                          <SelectItem key={key} value={key}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={reportData.description}
                    onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter report description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <Select 
                      value={reportData.format} 
                      onValueChange={(value) => setReportData(prev => ({ ...prev, format: value as ReportFormat }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORT_FORMAT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={reportData.parameters?.date_range?.start_date?.split('T')[0]}
                      onChange={(e) => setReportData(prev => ({
                        ...prev,
                        parameters: {
                          ...prev.parameters,
                          date_range: {
                            ...prev.parameters?.date_range,
                            start_date: new Date(e.target.value).toISOString(),
                            end_date: prev.parameters?.date_range?.end_date || new Date().toISOString()
                          }
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={reportData.parameters?.date_range?.end_date?.split('T')[0]}
                      onChange={(e) => setReportData(prev => ({
                        ...prev,
                        parameters: {
                          ...prev.parameters,
                          date_range: {
                            ...prev.parameters?.date_range,
                            start_date: prev.parameters?.date_range?.start_date || new Date().toISOString(),
                            end_date: new Date(e.target.value).toISOString()
                          }
                        }
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Access Control</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="visibility">Visibility</Label>
                      <Select 
                        value={reportData.visibility} 
                        onValueChange={(value) => setReportData(prev => ({ ...prev, visibility: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VISIBILITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Accessible Roles</Label>
                      <div className="space-y-2">
                        {['admin', 'hr', 'manager', 'employee'].map((role) => (
                          <div key={role} className="flex items-center space-x-2">
                            <Checkbox
                              id={`role-${role}`}
                              checked={reportData.accessible_roles?.includes(role as any)}
                              onCheckedChange={(checked) => {
                                const roles = reportData.accessible_roles || [];
                                if (checked) {
                                  setReportData(prev => ({ 
                                    ...prev, 
                                    accessible_roles: [...roles.filter(r => r !== role), role as any] 
                                  }));
                                } else {
                                  setReportData(prev => ({ 
                                    ...prev, 
                                    accessible_roles: roles.filter(r => r !== role) 
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={`role-${role}`} className="text-sm capitalize">
                              {role}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Scheduling (Optional)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select 
                        value={reportData.schedule?.frequency || "once"} 
                        onValueChange={(value) => setReportData(prev => ({
                          ...prev,
                          schedule: {
                            ...prev.schedule,
                            frequency: value as ReportFrequency,
                            schedule_time: prev.schedule?.schedule_time || "09:00",
                            recipients: prev.schedule?.recipients || []
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schedule-time">Schedule Time</Label>
                      <Input
                        id="schedule-time"
                        type="time"
                        value={reportData.schedule?.schedule_time || "09:00"}
                        onChange={(e) => setReportData(prev => ({
                          ...prev,
                          schedule: {
                            ...prev.schedule,
                            frequency: prev.schedule?.frequency || "once",
                            schedule_time: e.target.value,
                            recipients: prev.schedule?.recipients || []
                          }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReport} disabled={!reportData.title || !reportData.type}>
                  Generate Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.generating}</p>
                <p className="text-sm text-muted-foreground">Generating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.failed}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
            <Select value={filterType} onValueChange={setFilterType}>
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
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

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => {
                const IconComponent = getIconComponent(report.type);
                return (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-muted rounded">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{report.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {report.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {REPORT_TYPES[report.type]?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={REPORT_STATUS_COLORS[report.status]}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {report.generated_date ? (
                        <div>
                          <p className="text-sm">{formatDate(report.generated_date)}</p>
                          <p className="text-xs text-muted-foreground">by {report.generated_by_name}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not generated</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {report.file_size ? formatFileSize(report.file_size) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {report.download_count}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(report)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {report.status === 'completed' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownload(report)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {report.status === 'scheduled' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRunNow(report)}
                              className="text-green-600"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handlePauseSchedule(report)}
                              className="text-yellow-600"
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(report)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
