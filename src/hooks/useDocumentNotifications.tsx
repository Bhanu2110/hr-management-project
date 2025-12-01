import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DocumentNotification {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    action_url: string;
    created_at: string;
    document_id: string;
    document_title: string;
    category: string;
}

export function useDocumentNotifications() {
    const [notifications, setNotifications] = useState<DocumentNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { employee, isEmployee } = useAuth();

    const getStorageKey = () => {
        const id = employee?.employee_id || 'unknown';
        return `document_notifications_read_employee_${id}`;
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

    const fetchDocumentNotifications = async () => {
        if (!employee?.employee_id || !isEmployee) return;

        try {
            // Fetch documents directly from the documents table
            // using 'as any' because 'documents' table might be missing from generated types
            const { data, error } = await supabase
                .from('documents' as any)
                .select('*')
                .eq('employee_id', employee.employee_id)
                .order('uploaded_date', { ascending: false })
                .limit(10); // Show last 10 uploads

            if (error) {
                console.error('Error fetching document notifications:', error);
                return;
            }

            const documents = data as any[];
            const readSet = getReadSet();
            const documentNotifications: DocumentNotification[] = (documents || []).map(doc => {
                const id = `document_${doc.id}`;
                return {
                    id,
                    title: "New Document Available",
                    message: `A new document "${doc.title}" has been uploaded and is now available.`,
                    type: "document",
                    is_read: readSet.has(id),
                    action_url: "/documents",
                    created_at: doc.uploaded_date || doc.created_at || new Date().toISOString(),
                    document_id: doc.id,
                    document_title: doc.title,
                    category: doc.category || 'general'
                };
            });

            const visible = documentNotifications.filter(n => !n.is_read);
            setNotifications(visible);
            setUnreadCount(visible.length);
        } catch (error) {
            console.error('Error fetching document notifications:', error);
        }
    };

    const markAsRead = async (notificationId: string) => {
        setNotifications(prev => {
            const updated = prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n);
            const readSet = getReadSet();
            readSet.add(notificationId);
            persistReadSet(readSet);
            setUnreadCount(updated.filter(n => !n.is_read).length);
            return updated;
        });
    };

    const markAllAsRead = async () => {
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
        if (!employee?.employee_id || !isEmployee) return;

        fetchDocumentNotifications();

        // Subscribe to real-time updates on documents table
        const channel = supabase
            .channel('documents_notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'documents',
                    filter: `employee_id=eq.${employee.employee_id}`,
                } as any,
                () => {
                    fetchDocumentNotifications();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'documents',
                    filter: `employee_id=eq.${employee.employee_id}`,
                } as any,
                () => {
                    fetchDocumentNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isEmployee, employee?.employee_id]);

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        refreshNotifications: fetchDocumentNotifications
    };
}
