import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  MoreVertical, 
  Check, 
  Archive, 
  Trash2, 
  ExternalLink,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Megaphone,
  CheckCircle,
  AlertTriangle,
  Gift,
  Shield,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { 
  Notification, 
  NotificationType, 
  NotificationPriority,
  NotificationStatus,
  formatNotificationTime,
  getNotificationTypeColor,
  NOTIFICATION_PRIORITY_COLORS,
  NOTIFICATION_STATUS_COLORS,
  isRecentNotification
} from '@/types/notifications';

interface NotificationsViewerProps {
  employeeId: string;
}

// Mock data for demonstration
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Leave Request Approved',
    message: 'Your leave request for December 25-26, 2024 has been approved by your manager.',
    type: 'leave_request',
    priority: 'medium',
    status: 'unread',
    recipient_id: 'emp1',
    recipient_name: 'John Doe',
    recipient_email: 'john@company.com',
    sender_id: 'mgr1',
    sender_name: 'Sarah Manager',
    sender_role: 'Manager',
    channels: ['in_app', 'email'],
    is_broadcast: false,
    action_url: '/leave-requests',
    action_label: 'View Details',
    requires_action: false,
    created_at: '2024-12-10T10:30:00Z',
    updated_at: '2024-12-10T10:30:00Z',
  },
  {
    id: '2',
    title: 'Payroll Generated',
    message: 'Your salary slip for November 2024 is now available for download.',
    type: 'payroll',
    priority: 'high',
    status: 'read',
    recipient_id: 'emp1',
    recipient_name: 'John Doe',
    recipient_email: 'john@company.com',
    sender_id: 'system',
    sender_name: 'HR System',
    channels: ['in_app', 'email'],
    is_broadcast: false,
    action_url: '/salary-slips',
    action_label: 'Download Slip',
    requires_action: true,
    read_at: '2024-12-09T14:20:00Z',
    created_at: '2024-12-09T09:00:00Z',
    updated_at: '2024-12-09T14:20:00Z',
  },
  {
    id: '3',
    title: 'Company Holiday Announcement',
    message: 'The office will be closed on December 25th and 26th for Christmas holidays.',
    type: 'announcement',
    priority: 'medium',
    status: 'read',
    recipient_id: 'emp1',
    recipient_name: 'John Doe',
    recipient_email: 'john@company.com',
    sender_id: 'hr1',
    sender_name: 'HR Department',
    channels: ['in_app', 'email'],
    is_broadcast: true,
    requires_action: false,
    read_at: '2024-12-08T16:45:00Z',
    created_at: '2024-12-08T12:00:00Z',
    updated_at: '2024-12-08T16:45:00Z',
  },
  {
    id: '4',
    title: 'Attendance Alert',
    message: 'You have been marked absent for December 9th. Please contact HR if this is incorrect.',
    type: 'attendance',
    priority: 'high',
    status: 'unread',
    recipient_id: 'emp1',
    recipient_name: 'John Doe',
    recipient_email: 'john@company.com',
    sender_id: 'system',
    sender_name: 'Attendance System',
    channels: ['in_app', 'email', 'sms'],
    is_broadcast: false,
    action_url: '/attendance',
    action_label: 'Check Attendance',
    requires_action: true,
    created_at: '2024-12-09T18:00:00Z',
    updated_at: '2024-12-09T18:00:00Z',
  },
  {
    id: '5',
    title: 'Birthday Celebration',
    message: 'Join us in wishing Sarah Johnson a happy birthday today! 🎉',
    type: 'birthday',
    priority: 'low',
    status: 'read',
    recipient_id: 'emp1',
    recipient_name: 'John Doe',
    recipient_email: 'john@company.com',
    sender_id: 'hr1',
    sender_name: 'HR Department',
    channels: ['in_app'],
    is_broadcast: true,
    requires_action: false,
    read_at: '2024-12-07T11:30:00Z',
    created_at: '2024-12-07T09:00:00Z',
    updated_at: '2024-12-07T11:30:00Z',
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

export function NotificationsViewer({ employeeId }: NotificationsViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Filter notifications based on search and filters
  const filteredNotifications = useMemo(() => {
    return mockNotifications.filter(notification => {
      const matchesSearch = 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.sender_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === 'all' || notification.type === selectedType;
      const matchesPriority = selectedPriority === 'all' || notification.priority === selectedPriority;
      
      const matchesTab = 
        activeTab === 'all' ||
        (activeTab === 'unread' && notification.status === 'unread') ||
        (activeTab === 'read' && notification.status === 'read') ||
        (activeTab === 'archived' && notification.status === 'archived') ||
        (activeTab === 'action_required' && notification.requires_action);
      
      return matchesSearch && matchesType && matchesPriority && matchesTab;
    });
  }, [searchTerm, selectedType, selectedPriority, activeTab]);

  // Get notification counts for tabs
  const notificationCounts = useMemo(() => {
    return {
      all: mockNotifications.length,
      unread: mockNotifications.filter(n => n.status === 'unread').length,
      read: mockNotifications.filter(n => n.status === 'read').length,
      archived: mockNotifications.filter(n => n.status === 'archived').length,
      action_required: mockNotifications.filter(n => n.requires_action && n.status !== 'archived').length,
    };
  }, []);

  const handleMarkAsRead = (notificationId: string) => {
    console.log('Mark as read:', notificationId);
    // TODO: Implement mark as read functionality
  };

  const handleMarkAsUnread = (notificationId: string) => {
    console.log('Mark as unread:', notificationId);
    // TODO: Implement mark as unread functionality
  };

  const handleArchive = (notificationId: string) => {
    console.log('Archive notification:', notificationId);
    // TODO: Implement archive functionality
  };

  const handleDelete = (notificationId: string) => {
    console.log('Delete notification:', notificationId);
    // TODO: Implement delete functionality
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.status === 'unread') {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.action_url) {
      // TODO: Navigate to action URL
      console.log('Navigate to:', notification.action_url);
    }
  };

  const renderNotificationCard = (notification: Notification) => {
    const IconComponent = getNotificationIcon(notification.type);
    const isUnread = notification.status === 'unread';
    const isRecent = isRecentNotification(notification.created_at);

    return (
      <Card 
        key={notification.id}
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isUnread ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
        }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`p-2 rounded-lg ${getNotificationTypeColor(notification.type)}`}>
              <IconComponent className="h-4 w-4" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {notification.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                </div>
                
                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {notification.status === 'unread' ? (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}>
                        <Check className="mr-2 h-4 w-4" />
                        Mark as Read
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsUnread(notification.id);
                      }}>
                        <Bell className="mr-2 h-4 w-4" />
                        Mark as Unread
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleArchive(notification.id);
                    }}>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Metadata */}
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className={NOTIFICATION_PRIORITY_COLORS[notification.priority]}>
                  {notification.priority}
                </Badge>
                <Badge variant="outline" className={NOTIFICATION_STATUS_COLORS[notification.status]}>
                  {notification.status}
                </Badge>
                {notification.requires_action && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                    Action Required
                  </Badge>
                )}
                {isRecent && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    New
                  </Badge>
                )}
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>From: {notification.sender_name}</span>
                  {notification.is_broadcast && (
                    <Badge variant="outline" className="text-xs">
                      Broadcast
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span>{formatNotificationTime(notification.created_at)}</span>
                  {notification.action_url && (
                    <ExternalLink className="h-3 w-3" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
          <p className="text-muted-foreground">
            Stay updated with your latest notifications and announcements
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm">
            <Archive className="h-4 w-4 mr-2" />
            Archive All Read
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
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
                  <SelectItem value="leave_request">Leave Request</SelectItem>
                  <SelectItem value="payroll">Payroll</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="relative">
            All
            {notificationCounts.all > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 text-xs">
                {notificationCounts.all}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread" className="relative">
            Unread
            {notificationCounts.unread > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 text-xs">
                {notificationCounts.unread}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="read">
            Read
            {notificationCounts.read > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 text-xs">
                {notificationCounts.read}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="action_required">
            Action Required
            {notificationCounts.action_required > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 text-xs">
                {notificationCounts.action_required}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived
            {notificationCounts.archived > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 text-xs">
                {notificationCounts.archived}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(renderNotificationCard)
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No notifications found
                  </h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'all' 
                      ? "You don't have any notifications yet."
                      : `No ${activeTab.replace('_', ' ')} notifications found.`
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
