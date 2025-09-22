import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface LeaveNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url: string;
  created_at: string;
  leave_request_id: string;
  employee_name: string;
  leave_type: string;
  days: number;
}

export function useLeaveNotifications() {
  const [notifications, setNotifications] = useState<LeaveNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { employee, isAdmin } = useAuth();

  const fetchLeaveNotifications = async () => {
    if (!isAdmin || !employee?.id) return;

    try {
      // Fetch pending leave requests to create notifications
      const { data: leaveRequests, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          employee:employees(first_name, last_name, employee_id)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leave requests:', error);
        return;
      }

      // Convert leave requests to notifications
      const leaveNotifications: LeaveNotification[] = (leaveRequests || []).map(request => ({
        id: `leave_${request.id}`,
        title: "New Leave Request",
        message: `${request.employee?.first_name} ${request.employee?.last_name} has submitted a new ${request.leave_type} request for ${request.days} day(s)`,
        type: "leave_request",
        is_read: false, // For now, all are unread
        action_url: "/leave-requests",
        created_at: request.created_at,
        leave_request_id: request.id,
        employee_name: `${request.employee?.first_name} ${request.employee?.last_name}`,
        leave_type: request.leave_type,
        days: request.days
      }));

      setNotifications(leaveNotifications);
      setUnreadCount(leaveNotifications.length);
    } catch (error) {
      console.error('Error fetching leave notifications:', error);
    }
  };

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

  useEffect(() => {
    if (isAdmin && employee?.id) {
      fetchLeaveNotifications();

      // Set up real-time subscription for new leave requests
      const channel = supabase
        .channel('leave_requests_notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'leave_requests',
          },
          () => {
            // Refresh notifications when new leave request is added
            fetchLeaveNotifications();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'leave_requests',
          },
          () => {
            // Refresh notifications when leave request is updated (approved/rejected)
            fetchLeaveNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin, employee?.id]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchLeaveNotifications
  };
}
