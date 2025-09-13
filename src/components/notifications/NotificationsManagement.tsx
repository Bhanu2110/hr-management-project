import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Send, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Megaphone,
  CheckCircle,
  AlertTriangle,
  Gift,
  Shield,
  Settings,
  Bell,
  Eye,
  Copy,
  Download,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Notification, 
  NotificationType, 
  NotificationPriority,
  NotificationChannel,
  NotificationCreateRequest,
  NotificationStats,
  NotificationBatch,
  formatNotificationTime,
  getNotificationTypeColor,
  NOTIFICATION_PRIORITY_COLORS,
  NOTIFICATION_STATUS_COLORS,
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS
} from '@/types/notifications';

// Mock data for demonstration
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'System Maintenance Scheduled',
    message: 'The HR system will undergo maintenance on December 15th from 2:00 AM to 4:00 AM IST.',
    type: 'system',
    priority: 'high',
    status: 'read',
    recipient_id: 'all',
    recipient_name: 'All Employees',
    recipient_email: '',
    sender_id: 'admin1',
    sender_name: 'System Administrator',
    sender_role: 'Admin',
    channels: ['in_app', 'email'],
    is_broadcast: true,
    requires_action: false,
    created_at: '2024-12-10T10:30:00Z',
    updated_at: '2024-12-10T10:30:00Z',
  },
  {
    id: '2',
    title: 'New Policy Update',
    message: 'Updated work from home policy has been published. Please review the new guidelines.',
    type: 'policy',
    priority: 'medium',
    status: 'read',
    recipient_id: 'all',
    recipient_name: 'All Employees',
    recipient_email: '',
    sender_id: 'hr1',
    sender_name: 'HR Department',
    sender_role: 'HR',
    channels: ['in_app', 'email'],
    is_broadcast: true,
    action_url: '/policies',
    action_label: 'Review Policy',
    requires_action: true,
    created_at: '2024-12-09T14:00:00Z',
    updated_at: '2024-12-09T14:00:00Z',
  },
];

const mockStats: NotificationStats = {
  total_notifications: 156,
  unread_count: 23,
  read_count: 98,
  archived_count: 35,
  notifications_by_type: {
    system: 12,
    leave_request: 34,
    attendance: 28,
    payroll: 18,
    document: 15,
    announcement: 22,
    reminder: 14,
    approval: 8,
    alert: 3,
    birthday: 1,
    holiday: 1,
    policy: 0,
  },
  notifications_by_priority: {
    low: 45,
    medium: 78,
    high: 28,
    urgent: 5,
  },
  recent_notifications: 12,
  click_through_rate: 68.5,
  average_read_time: 2.3,
};

const mockBatches: NotificationBatch[] = [
  {
    id: 'batch1',
    name: 'December Holiday Announcement',
    description: 'Company holiday schedule for December',
    type: 'announcement',
    template_id: 'template1',
    total_recipients: 150,
    sent_count: 150,
    failed_count: 0,
    status: 'completed',
    completed_at: '2024-12-08T16:30:00Z',
    created_by: 'hr1',
    created_by_name: 'HR Manager',
    created_at: '2024-12-08T15:00:00Z',
    updated_at: '2024-12-08T16:30:00Z',
  },
  {
    id: 'batch2',
    name: 'Payroll Processing Complete',
    description: 'November salary notifications',
    type: 'payroll',
    template_id: 'template2',
    total_recipients: 145,
    sent_count: 142,
    failed_count: 3,
    status: 'completed',
    completed_at: '2024-12-01T10:15:00Z',
    created_by: 'admin1',
    created_by_name: 'System Admin',
    created_at: '2024-12-01T09:00:00Z',
    updated_at: '2024-12-01T10:15:00Z',
  },
];

const getNotificationIcon = (type: NotificationType) => {
  const iconMap = {
    system: Settings,
    leave_request: Calendar,
    attendance: Clock,
    payroll: DollarSign,
    document: FileText,
    announcement: Megaphone,
    reminder: Bell,
    approval: CheckCircle,
    alert: AlertTriangle,
    birthday: Gift,
    holiday: Calendar,
    policy: Shield,
  };
  
  return iconMap[type] || Bell;
};

export function NotificationsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('notifications');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState<Partial<NotificationCreateRequest>>({
    channels: ['in_app'],
    priority: 'medium',
    type: 'announcement',
  });

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return mockNotifications.filter(notification => {
      const matchesSearch = 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === 'all' || notification.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || notification.status === selectedStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchTerm, selectedType, selectedStatus]);

  const handleCreateNotification = () => {
    console.log('Creating notification:', newNotification);
    // TODO: Implement notification creation
    setIsCreateDialogOpen(false);
    setNewNotification({
      channels: ['in_app'],
      priority: 'medium',
      type: 'announcement',
    });
  };

  const handleEditNotification = (notificationId: string) => {
    console.log('Edit notification:', notificationId);
    // TODO: Implement edit functionality
  };

  const handleDeleteNotification = (notificationId: string) => {
    console.log('Delete notification:', notificationId);
    // TODO: Implement delete functionality
  };

  const handleDuplicateNotification = (notificationId: string) => {
    console.log('Duplicate notification:', notificationId);
    // TODO: Implement duplicate functionality
  };

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Notifications</p>
              <p className="text-2xl font-bold">{mockStats.total_notifications}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-800 rounded-lg">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unread</p>
              <p className="text-2xl font-bold">{mockStats.unread_count}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 text-green-800 rounded-lg">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Click Rate</p>
              <p className="text-2xl font-bold">{mockStats.click_through_rate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-800 rounded-lg">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recent (24h)</p>
              <p className="text-2xl font-bold">{mockStats.recent_notifications}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsTable = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Notification Management</CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Notification</DialogTitle>
                <DialogDescription>
                  Send a notification to employees or specific groups.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select 
                      value={newNotification.type} 
                      onValueChange={(value: NotificationType) => 
                        setNewNotification(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(NOTIFICATION_TYPES).map(([key, type]) => (
                          <SelectItem key={key} value={key}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={newNotification.priority} 
                      onValueChange={(value: NotificationPriority) => 
                        setNewNotification(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newNotification.title || ''}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter notification title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={newNotification.message || ''}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter notification message"
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label>Delivery Channels</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {NOTIFICATION_CHANNELS.map((channel) => (
                      <div key={channel.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={channel.value}
                          checked={newNotification.channels?.includes(channel.value as NotificationChannel)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewNotification(prev => ({
                                ...prev,
                                channels: [...(prev.channels || []), channel.value as NotificationChannel]
                              }));
                            } else {
                              setNewNotification(prev => ({
                                ...prev,
                                channels: prev.channels?.filter(c => c !== channel.value)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={channel.value} className="text-sm">
                          {channel.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="broadcast"
                    checked={newNotification.is_broadcast || false}
                    onCheckedChange={(checked) => 
                      setNewNotification(prev => ({ ...prev, is_broadcast: checked as boolean }))
                    }
                  />
                  <Label htmlFor="broadcast">Send to all employees</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requires_action"
                    checked={newNotification.requires_action || false}
                    onCheckedChange={(checked) => 
                      setNewNotification(prev => ({ ...prev, requires_action: checked as boolean }))
                    }
                  />
                  <Label htmlFor="requires_action">Requires action from recipients</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNotification}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(NOTIFICATION_TYPES).map(([key, type]) => (
                  <SelectItem key={key} value={key}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notifications Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Notification</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              
              return (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getNotificationTypeColor(notification.type)}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getNotificationTypeColor(notification.type)}>
                      {NOTIFICATION_TYPES[notification.type]?.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={NOTIFICATION_PRIORITY_COLORS[notification.priority]}>
                      {notification.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {notification.is_broadcast ? 'All Employees' : notification.recipient_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={NOTIFICATION_STATUS_COLORS[notification.status]}>
                      {notification.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatNotificationTime(notification.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditNotification(notification.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateNotification(notification.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No notifications found
            </h3>
            <p className="text-muted-foreground">
              No notifications match your current filters.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderBatchesTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>Notification Batches</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Success Rate</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockBatches.map((batch) => {
              const successRate = ((batch.sent_count / batch.total_recipients) * 100).toFixed(1);
              
              return (
                <TableRow key={batch.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{batch.name}</p>
                      {batch.description && (
                        <p className="text-sm text-muted-foreground">{batch.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getNotificationTypeColor(batch.type)}>
                      {NOTIFICATION_TYPES[batch.type]?.name}
                    </Badge>
                  </TableCell>
                  <TableCell>{batch.total_recipients}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        batch.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                        batch.status === 'sending' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        batch.status === 'failed' ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }
                    >
                      {batch.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{successRate}%</span>
                      {batch.failed_count > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {batch.failed_count} failed
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{batch.created_by_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatNotificationTime(batch.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Export Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notifications Management</h2>
          <p className="text-muted-foreground">
            Create, manage, and track notifications sent to employees
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="mt-6">
          {renderNotificationsTable()}
        </TabsContent>

        <TabsContent value="batches" className="mt-6">
          {renderBatchesTable()}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-muted-foreground">
                Detailed analytics and reporting features coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
