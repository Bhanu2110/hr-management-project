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

  const getStorageKey = () => {
    const role = isAdmin ? 'admin' : 'employee';
    const id = employee?.id || 'unknown';
    return `leave_notifications_read_${role}_${id}`;
  };

  const getReadSet = (): Set<string> => {
    try {
      const raw = localStorage.getItem(getStorageKey());
      if (!raw) return new Set();
      const arr = JSON.parse(raw) as string[];
      return new Set(arr);
    } catch {
      return new Set();
    }
  };

  const persistReadSet = (set: Set<string>) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(Array.from(set)));
    } catch {
      // ignore storage errors
    }
  };

  const fetchLeaveNotifications = async () => {
    if (!employee?.id) return;

    try {
      if (isAdmin) {
        // Admins: show pending leave requests
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

        const readSet = getReadSet();
        const leaveNotifications: LeaveNotification[] = (leaveRequests || []).map(request => {
          const id = `leave_${request.id}`;
          return {
            id,
            title: "New Leave Request",
            message: `${request.employee?.first_name} ${request.employee?.last_name} has submitted a new ${request.leave_type} request for ${request.days} day(s)`,
            type: "leave_request",
            is_read: readSet.has(id),
            action_url: "/leave-requests",
            created_at: request.created_at,
            leave_request_id: request.id,
            employee_name: `${request.employee?.first_name} ${request.employee?.last_name}`,
            leave_type: request.leave_type,
            days: request.days
          };
        });
        const visible = leaveNotifications.filter(n => !n.is_read);
        setNotifications(visible);
        setUnreadCount(visible.length);
      } else {
        // Employees: show status updates for their own leave requests (approved/rejected)
        const { data: myLeaves, error } = await supabase
          .from('leave_requests')
          .select('*')
          .eq('employee_id', employee.id)
          .in('status', ['approved', 'rejected'] as any)
          .order('updated_at', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching my leave notifications:', error);
          return;
        }

        const readSet = getReadSet();
        const myNotifications: LeaveNotification[] = (myLeaves || []).map(request => {
          const id = `my_leave_${request.id}_${request.status}`;
          return {
            id,
            title: request.status === 'approved' ? 'Leave Request Approved' : 'Leave Request Rejected',
            message: `Your ${request.leave_type} request for ${request.days} day(s) was ${request.status}.`,
            type: 'leave_request',
            is_read: readSet.has(id),
            action_url: '/employee/leave-requests',
            created_at: request.updated_at || request.created_at,
            leave_request_id: request.id,
            employee_name: '',
            leave_type: request.leave_type,
            days: request.days,
          };
        });
        const visible = myNotifications.filter(n => !n.is_read);
        setNotifications(visible);
        setUnreadCount(visible.length);
      }
    } catch (error) {
      console.error('Error fetching leave notifications:', error);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n);
      const readSet = getReadSet();
      readSet.add(notificationId);
      persistReadSet(readSet);
      setUnreadCount(updated.filter(n => !n.is_read).length);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, is_read: true }));
      const readSet = getReadSet();
      updated.forEach(n => readSet.add(n.id));
      persistReadSet(readSet);
      setUnreadCount(0);
      return updated;
    });
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => {
      const readSet = getReadSet();
      readSet.add(notificationId);
      persistReadSet(readSet);
      const filtered = prev.filter(n => n.id !== notificationId);
      setUnreadCount(filtered.filter(n => !n.is_read).length);
      return filtered;
    });
  };

  useEffect(() => {
    if (!employee?.id) return;

    fetchLeaveNotifications();

    const channel = supabase
      .channel('leave_requests_notifications')
      .on(
        'postgres_changes',
        {
          event: isAdmin ? 'INSERT' : 'UPDATE',
          schema: 'public',
          table: 'leave_requests',
          filter: isAdmin ? undefined : `employee_id=eq.${employee.id}`,
        } as any,
        () => {
          fetchLeaveNotifications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leave_requests',
          filter: isAdmin ? undefined : `employee_id=eq.${employee.id}`,
        } as any,
        () => {
          fetchLeaveNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, employee?.id]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    refreshNotifications: fetchLeaveNotifications
  };
}
