import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, X, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SimpleNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export function SimpleNotificationBell() {
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const { employee, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Mock notifications for demo - in real app this would come from database
  useEffect(() => {
    if (isAdmin) {
      // Simulate some notifications
      const mockNotifications: SimpleNotification[] = [
        {
          id: "1",
          title: "New Leave Request",
          message: "John Doe has submitted a new Annual Leave request for 3 day(s)",
          type: "leave_request",
          is_read: false,
          action_url: "/leave-requests",
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        },
        {
          id: "2", 
          title: "New Leave Request",
          message: "Sarah Wilson has submitted a new Sick Leave request for 2 day(s)",
          type: "leave_request",
          is_read: false,
          action_url: "/leave-requests",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
    }
  }, [isAdmin]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: SimpleNotification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    if (notification.action_url) {
      navigate(notification.action_url);
      setOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'leave_request':
        return <Calendar className="h-4 w-4 text-warning" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'leave_request':
        return 'bg-warning/10 border-warning/20';
      default:
        return 'bg-primary/10 border-primary/20';
    }
  };

  // Don't show notification bell for employees
  if (!isAdmin) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="h-96">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground">
                  You'll see notifications here when employees submit leave requests
                </p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div
                      className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        !notification.is_read ? getNotificationColor(notification.type) : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-medium truncate ${
                              !notification.is_read ? 'font-semibold' : ''
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                            {notification.action_url && (
                              <Badge variant="outline" className="text-xs ml-auto">
                                Click to view
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < notifications.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t bg-muted/30">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  navigate('/leave-requests');
                  setOpen(false);
                }}
              >
                View all leave requests
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
