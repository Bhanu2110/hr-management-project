import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Form16Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    action_url: string;
    created_at: string;
    form16_id: string;
    financial_year: string;
    file_name: string;
}

export function useForm16Notifications() {
    const [notifications, setNotifications] = useState<Form16Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { employee, isEmployee } = useAuth();

    const getStorageKey = () => {
        const id = employee?.id || 'unknown';
        return `form16_notifications_read_employee_${id}`;
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

    const fetchForm16Notifications = async () => {
        if (!employee?.id || !isEmployee) return;

        try {
            // Employees: show their new Form 16 documents
            const { data: form16Docs, error } = await supabase
                .from('form16_documents')
                .select('*')
                .eq('employee_id', employee.id)
                .order('created_at', { ascending: false })
                .limit(10); // Show last 10 uploads

            if (error) {
                console.error('Error fetching Form 16 documents:', error);
                return;
            }

            const readSet = getReadSet();
            const form16Notifications: Form16Notification[] = (form16Docs || []).map(doc => {
                const id = `form16_${doc.id}`;
                return {
                    id,
                    title: "New Form 16 Available",
                    message: `Your Form 16 for financial year ${doc.financial_year} has been uploaded and is now available for download.`,
                    type: "form16",
                    is_read: readSet.has(id),
                    action_url: "/form-16",
                    created_at: doc.created_at || doc.uploaded_at || new Date().toISOString(),
                    form16_id: doc.id,
                    financial_year: doc.financial_year,
                    file_name: doc.file_name
                };
            });

            const visible = form16Notifications.filter(n => !n.is_read);
            setNotifications(visible);
            setUnreadCount(visible.length);
        } catch (error) {
            console.error('Error fetching Form 16 notifications:', error);
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
        if (!employee?.id || !isEmployee) return;

        fetchForm16Notifications();

        // Subscribe to real-time updates
        const channel = supabase
            .channel('form16_documents_notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'form16_documents',
                    filter: `employee_id=eq.${employee.id}`,
                } as any,
                () => {
                    fetchForm16Notifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isEmployee, employee?.id]);

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        refreshNotifications: fetchForm16Notifications
    };
}
