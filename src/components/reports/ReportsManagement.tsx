import { useState, useEffect } from "react";
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
  XCircle,
  Loader2
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from "@/integrations/supabase/types";
import { useAuth } from '@/hooks/useAuth';

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
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { employee } = useAuth();

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

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select<"*", Report>('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      setReports((data as Report[]) || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reports.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
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

  const handleCreateReport = async () => {
    if (!reportData.title) {
      toast({
        title: "Error",
        description: "Please enter a report title.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get the current user - check admins first, then employees
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "User not authenticated. Please log in again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Try to get admin info first
      let generatorName = "Admin User";
      let generatorId = user.id;

      const { data: adminData } = await supabase
        .from('admins')
        .select('id, first_name, last_name')
        .eq('user_id', user.id)
        .single();

      if (adminData) {
        generatorName = `${adminData.first_name} ${adminData.last_name}`;
        generatorId = adminData.id;
      } else if (employee) {
        generatorName = `${employee.first_name} ${employee.last_name}`;
        generatorId = employee.id;
      }

      // Determine if this is a scheduled report
      const isScheduled = reportData.schedule?.frequency && reportData.schedule.frequency !== 'once';
      const initialStatus = isScheduled ? 'scheduled' : 'generating';

      const { data, error } = await supabase
        .from('reports')
        .insert([{
          title: reportData.title,
          description: reportData.description || null,
          type: (reportData.type || 'attendance') as any,
          format: (reportData.format || 'pdf') as any,
          parameters: reportData.parameters as any,
          visibility: (reportData.visibility || 'role_based') as any,
          accessible_roles: reportData.accessible_roles as any || ['admin'],
          accessible_departments: reportData.accessible_departments as any || [],
          accessible_employees: reportData.accessible_employees as any || [],
          frequency: (reportData.schedule?.frequency || 'once') as any,
          scheduled_date: isScheduled ? new Date().toISOString() : null,
          next_run_date: isScheduled ? new Date().toISOString() : null,
          generated_by: generatorId,
          generated_by_name: generatorName,
          generated_date: isScheduled ? null : new Date().toISOString(),
          status: initialStatus as any,
          download_count: 0,
          file_size: null,
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Simulate report generation completion after 2 seconds if not scheduled
      if (!isScheduled && data) {
        setTimeout(async () => {
          const fileSize = Math.floor(Math.random() * 500000) + 50000; // Random size between 50KB and 550KB
          await supabase
            .from('reports')
            .update({ 
              status: 'completed' as any,
              file_size: fileSize,
              generated_date: new Date().toISOString()
            })
            .eq('id', data.id);
          
          fetchReports();
        }, 2000);
      }

      toast({
        title: "Success",
        description: isScheduled 
          ? "Report scheduled successfully." 
          : "Report generation started. It will be ready shortly.",
      });
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
      fetchReports();
    } catch (error) {
      console.error("Error creating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (report: Report) => {
    console.log("Downloading report:", report.title);
  };

  const handleEdit = (report: Report) => {
    console.log("Editing report:", report.id);
  };

  const handleDelete = async (report: Report) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', report.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Report deleted successfully.",
      });
      fetchReports(); // Refresh the list of reports
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        title: "Error",
        description: "Failed to delete report.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunNow = async (report: Report) => {
    try {
      await supabase
        .from('reports')
        .update({ 
          status: 'generating' as any,
          generated_date: new Date().toISOString()
        })
        .eq('id', report.id);

      toast({
        title: "Report Started",
        description: "Report generation has started.",
      });

      // Simulate completion after 2 seconds
      setTimeout(async () => {
        const fileSize = Math.floor(Math.random() * 500000) + 50000;
        await supabase
          .from('reports')
          .update({ 
            status: 'completed' as any,
            file_size: fileSize
          })
          .eq('id', report.id);
        fetchReports();
      }, 2000);

      fetchReports();
    } catch (error) {
      console.error("Error running report:", error);
      toast({
        title: "Error",
        description: "Failed to run report.",
        variant: "destructive",
      });
    }
  };

  const handlePauseSchedule = async (report: Report) => {
    try {
      await supabase
        .from('reports')
        .update({ 
          status: 'draft' as any,
          next_run_date: null
        })
        .eq('id', report.id);

      toast({
        title: "Schedule Paused",
        description: "Report schedule has been paused.",
      });
      fetchReports();
    } catch (error) {
      console.error("Error pausing schedule:", error);
      toast({
        title: "Error",
        description: "Failed to pause schedule.",
        variant: "destructive",
      });
    }
  };

  // Calculate statistics
  const stats = {
    total: reports.length,
    completed: reports.filter(r => r.status === 'completed').length,
    generating: reports.filter(r => r.status === 'generating').length,
    scheduled: reports.filter(r => r.status === 'scheduled').length,
    failed: reports.filter(r => r.status === 'failed').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading reports...</p>
      </div>
    );
  }

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
              <Button variant="default" className="gap-2">
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
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileText className="h-8 w-8 mb-2" />
                      <p>No reports found</p>
                      <p className="text-sm">Click "Generate Report" to create your first report</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => {
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
                              {report.description || 'No description'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {REPORT_TYPES[report.type]?.name || report.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={REPORT_STATUS_COLORS[report.status] || 'bg-gray-500'}>
                          {report.status === 'generating' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.generated_date ? (
                          <div>
                            <p className="text-sm">{formatDate(report.generated_date)}</p>
                            <p className="text-xs text-muted-foreground">by {report.generated_by_name || 'Unknown'}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            {report.status === 'scheduled' ? 'Scheduled' : 'Pending'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {report.file_size ? formatFileSize(report.file_size) : '-'}
                      </TableCell>
                      <TableCell>
                        {report.download_count || 0}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(report)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {report.status === 'completed' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownload(report)}
                              title="Download"
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
                                title="Run Now"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handlePauseSchedule(report)}
                                className="text-yellow-600"
                                title="Pause Schedule"
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(report)}
                            className="text-destructive hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}