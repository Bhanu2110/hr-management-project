import { supabase } from '@/integrations/supabase/client';

export interface Notification {
    id: string;
    recipient_id: string;
    title: string;
    message: string;
    type: string;
    related_id?: string | null;
    related_table?: string | null;
    action_url?: string | null;
    is_read: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateNotificationRequest {
    recipient_id: string;
    title: string;
    message: string;
    type: string;
    related_id?: string;
    related_table?: string;
    action_url?: string;
}

/**
 * Create a notification for an employee
 */
export async function createNotification(request: CreateNotificationRequest): Promise<Notification> {
    const { data, error } = await supabase
        .from('notifications')
        .insert([{
            recipient_id: request.recipient_id,
            title: request.title,
            message: request.message,
            type: request.type,
            related_id: request.related_id || null,
            related_table: request.related_table || null,
            action_url: request.action_url || null,
            is_read: false,
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating notification:', error);
        throw error;
    }

    return data;
}

/**
 * Fetch notifications for the current employee
 */
export async function fetchEmployeeNotifications(employeeId: string): Promise<Notification[]> {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', employeeId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }

    return data || [];
}

/**
 * Fetch unread notifications count
 */
export async function fetchUnreadNotificationsCount(employeeId: string): Promise<number> {
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', employeeId)
        .eq('is_read', false);

    if (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }

    return count || 0;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(id: string): Promise<void> {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

    if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
}

/**
 * Mark all notifications as read for an employee
 */
export async function markAllNotificationsAsRead(employeeId: string): Promise<void> {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', employeeId)
        .eq('is_read', false);

    if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string): Promise<void> {
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
}
