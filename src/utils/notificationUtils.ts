import { 
  Notification, 
  NotificationType, 
  NotificationPriority, 
  NotificationStatus,
  NotificationChannel,
  NotificationCreateRequest,
  NotificationPreferences,
  NotificationStats,
  NotificationBatch,
  NotificationRule,
  NotificationTemplate,
  getPriorityLevel,
  shouldShowNotification
} from '@/types/notifications';

/**
 * Validates a notification creation request
 */
export function validateNotificationRequest(request: NotificationCreateRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields validation
  if (!request.title?.trim()) {
    errors.push('Title is required');
  }

  if (!request.message?.trim()) {
    errors.push('Message is required');
  }

  if (!request.type) {
    errors.push('Notification type is required');
  }

  if (!request.priority) {
    errors.push('Priority is required');
  }

  if (!request.channels || request.channels.length === 0) {
    errors.push('At least one delivery channel is required');
  }

  // Title length validation
  if (request.title && request.title.length > 100) {
    errors.push('Title must be 100 characters or less');
  }

  // Message length validation
  if (request.message && request.message.length > 1000) {
    errors.push('Message must be 1000 characters or less');
  }

  // Recipients validation
  if (!request.is_broadcast && 
      (!request.recipient_ids || request.recipient_ids.length === 0) &&
      (!request.recipient_roles || request.recipient_roles.length === 0) &&
      (!request.recipient_departments || request.recipient_departments.length === 0)) {
    errors.push('Recipients are required when not broadcasting to all employees');
  }

  // Scheduled date validation
  if (request.scheduled_at) {
    const scheduledDate = new Date(request.scheduled_at);
    const now = new Date();
    
    if (scheduledDate <= now) {
      errors.push('Scheduled date must be in the future');
    }
  }

  // Expiry date validation
  if (request.expires_at) {
    const expiryDate = new Date(request.expires_at);
    const now = new Date();
    
    if (expiryDate <= now) {
      errors.push('Expiry date must be in the future');
    }
    
    if (request.scheduled_at && expiryDate <= new Date(request.scheduled_at)) {
      errors.push('Expiry date must be after scheduled date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generates default notification preferences for a user
 */
export function generateDefaultNotificationPreferences(userId: string): NotificationPreferences {
  const defaultTypePreferences = {
    enabled: true,
    channels: ['in_app', 'email'] as NotificationChannel[],
    priority_threshold: 'low' as NotificationPriority,
  };

  return {
    user_id: userId,
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    in_app_notifications: true,
    notification_types: {
      system: { ...defaultTypePreferences, priority_threshold: 'medium' },
      leave_request: defaultTypePreferences,
      attendance: { ...defaultTypePreferences, priority_threshold: 'medium' },
      payroll: { ...defaultTypePreferences, priority_threshold: 'high' },
      document: defaultTypePreferences,
      announcement: defaultTypePreferences,
      reminder: defaultTypePreferences,
      approval: { ...defaultTypePreferences, priority_threshold: 'high' },
      alert: { ...defaultTypePreferences, priority_threshold: 'high' },
      birthday: { ...defaultTypePreferences, channels: ['in_app'] as NotificationChannel[] },
      holiday: defaultTypePreferences,
      policy: { ...defaultTypePreferences, priority_threshold: 'medium' },
    },
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    digest_enabled: false,
    digest_frequency: 'daily',
    digest_time: '09:00',
    updated_at: new Date().toISOString(),
  };
}

/**
 * Filters notifications based on user preferences and criteria
 */
export function filterNotifications(
  notifications: Notification[],
  criteria: {
    userId?: string;
    types?: NotificationType[];
    priorities?: NotificationPriority[];
    statuses?: NotificationStatus[];
    searchTerm?: string;
    dateFrom?: string;
    dateTo?: string;
    requiresAction?: boolean;
    preferences?: NotificationPreferences;
  }
): Notification[] {
  return notifications.filter(notification => {
    // User filter
    if (criteria.userId && notification.recipient_id !== criteria.userId) {
      return false;
    }

    // Type filter
    if (criteria.types && criteria.types.length > 0 && !criteria.types.includes(notification.type)) {
      return false;
    }

    // Priority filter
    if (criteria.priorities && criteria.priorities.length > 0 && !criteria.priorities.includes(notification.priority)) {
      return false;
    }

    // Status filter
    if (criteria.statuses && criteria.statuses.length > 0 && !criteria.statuses.includes(notification.status)) {
      return false;
    }

    // Search term filter
    if (criteria.searchTerm) {
      const searchLower = criteria.searchTerm.toLowerCase();
      const matchesSearch = 
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower) ||
        notification.sender_name?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) {
        return false;
      }
    }

    // Date range filter
    if (criteria.dateFrom) {
      const notificationDate = new Date(notification.created_at);
      const fromDate = new Date(criteria.dateFrom);
      if (notificationDate < fromDate) {
        return false;
      }
    }

    if (criteria.dateTo) {
      const notificationDate = new Date(notification.created_at);
      const toDate = new Date(criteria.dateTo);
      if (notificationDate > toDate) {
        return false;
      }
    }

    // Requires action filter
    if (criteria.requiresAction !== undefined && notification.requires_action !== criteria.requiresAction) {
      return false;
    }

    // User preferences filter
    if (criteria.preferences && !shouldShowNotification(notification, criteria.preferences)) {
      return false;
    }

    return true;
  });
}

/**
 * Sorts notifications by priority and date
 */
export function sortNotifications(
  notifications: Notification[],
  sortBy: 'priority' | 'date' | 'status' = 'date',
  sortOrder: 'asc' | 'desc' = 'desc'
): Notification[] {
  return [...notifications].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'priority':
        comparison = getPriorityLevel(b.priority) - getPriorityLevel(a.priority);
        break;
      case 'date':
        comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        break;
      case 'status':
        const statusOrder = { unread: 3, read: 2, archived: 1 };
        comparison = statusOrder[b.status] - statusOrder[a.status];
        break;
    }

    return sortOrder === 'desc' ? comparison : -comparison;
  });
}

/**
 * Groups notifications by type or date
 */
export function groupNotifications(
  notifications: Notification[],
  groupBy: 'type' | 'date' | 'priority' | 'status'
): Record<string, Notification[]> {
  return notifications.reduce((groups, notification) => {
    let key: string;

    switch (groupBy) {
      case 'type':
        key = notification.type;
        break;
      case 'date':
        key = new Date(notification.created_at).toDateString();
        break;
      case 'priority':
        key = notification.priority;
        break;
      case 'status':
        key = notification.status;
        break;
      default:
        key = 'all';
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(notification);

    return groups;
  }, {} as Record<string, Notification[]>);
}

/**
 * Calculates notification statistics
 */
export function calculateNotificationStats(notifications: Notification[]): NotificationStats {
  const total = notifications.length;
  const unread = notifications.filter(n => n.status === 'unread').length;
  const read = notifications.filter(n => n.status === 'read').length;
  const archived = notifications.filter(n => n.status === 'archived').length;

  // Count by type
  const byType = notifications.reduce((acc, notification) => {
    acc[notification.type] = (acc[notification.type] || 0) + 1;
    return acc;
  }, {} as Record<NotificationType, number>);

  // Count by priority
  const byPriority = notifications.reduce((acc, notification) => {
    acc[notification.priority] = (acc[notification.priority] || 0) + 1;
    return acc;
  }, {} as Record<NotificationPriority, number>);

  // Recent notifications (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = notifications.filter(n => new Date(n.created_at) > oneDayAgo).length;

  // Calculate click-through rate
  const withActions = notifications.filter(n => n.action_url).length;
  const clicked = notifications.filter(n => n.clicked_at).length;
  const clickThroughRate = withActions > 0 ? (clicked / withActions) * 100 : 0;

  // Calculate average read time
  const readNotifications = notifications.filter(n => n.read_at);
  const totalReadTime = readNotifications.reduce((acc, notification) => {
    if (notification.read_at) {
      const readTime = new Date(notification.read_at).getTime() - new Date(notification.created_at).getTime();
      return acc + (readTime / (1000 * 60)); // Convert to minutes
    }
    return acc;
  }, 0);
  const averageReadTime = readNotifications.length > 0 ? totalReadTime / readNotifications.length : 0;

  return {
    total_notifications: total,
    unread_count: unread,
    read_count: read,
    archived_count: archived,
    notifications_by_type: byType,
    notifications_by_priority: byPriority,
    recent_notifications: recent,
    click_through_rate: Math.round(clickThroughRate * 10) / 10,
    average_read_time: Math.round(averageReadTime * 10) / 10,
  };
}

/**
 * Formats notification content with variables
 */
export function formatNotificationContent(
  template: string,
  variables: Record<string, any>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
}

/**
 * Generates notification template variables
 */
export function generateNotificationVariables(
  type: NotificationType,
  data: Record<string, any>
): Record<string, any> {
  const baseVariables = {
    employee_name: data.employee_name || '',
    company_name: data.company_name || 'Company',
    current_date: new Date().toLocaleDateString('en-IN'),
    current_time: new Date().toLocaleTimeString('en-IN'),
  };

  switch (type) {
    case 'leave_request':
      return {
        ...baseVariables,
        leave_type: data.leave_type || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        days_count: data.days_count || '',
        manager_name: data.manager_name || '',
        status: data.status || '',
      };

    case 'payroll':
      return {
        ...baseVariables,
        salary_month: data.salary_month || '',
        gross_salary: data.gross_salary || '',
        net_salary: data.net_salary || '',
        pay_date: data.pay_date || '',
      };

    case 'attendance':
      return {
        ...baseVariables,
        attendance_date: data.attendance_date || '',
        check_in_time: data.check_in_time || '',
        check_out_time: data.check_out_time || '',
        total_hours: data.total_hours || '',
      };

    case 'document':
      return {
        ...baseVariables,
        document_name: data.document_name || '',
        document_type: data.document_type || '',
        uploaded_by: data.uploaded_by || '',
        expiry_date: data.expiry_date || '',
      };

    default:
      return baseVariables;
  }
}

/**
 * Checks if user is in quiet hours
 */
export function isInQuietHours(preferences: NotificationPreferences): boolean {
  if (!preferences.quiet_hours_enabled) {
    return false;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [startHour, startMin] = preferences.quiet_hours_start.split(':').map(Number);
  const [endHour, endMin] = preferences.quiet_hours_end.split(':').map(Number);
  
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  if (startTime <= endTime) {
    // Same day quiet hours (e.g., 22:00 to 23:59)
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    // Overnight quiet hours (e.g., 22:00 to 08:00)
    return currentTime >= startTime || currentTime <= endTime;
  }
}

/**
 * Estimates notification delivery time
 */
export function estimateDeliveryTime(
  recipientCount: number,
  channels: string[]
): { estimated_minutes: number; estimated_completion: string } {
  // Base time per recipient per channel (in seconds)
  const baseTimePerRecipient = {
    in_app: 0.1,
    email: 2,
    sms: 3,
    push: 0.5,
  };

  let totalSeconds = 0;
  channels.forEach(channel => {
    const channelTime = baseTimePerRecipient[channel as keyof typeof baseTimePerRecipient] || 1;
    totalSeconds += recipientCount * channelTime;
  });

  // Add processing overhead
  totalSeconds += Math.min(recipientCount * 0.1, 300); // Max 5 minutes overhead

  const estimatedMinutes = Math.ceil(totalSeconds / 60);
  const completionTime = new Date(Date.now() + estimatedMinutes * 60 * 1000);

  return {
    estimated_minutes: estimatedMinutes,
    estimated_completion: completionTime.toISOString(),
  };
}

/**
 * Generates notification batch summary
 */
export function generateBatchSummary(batch: NotificationBatch): {
  success_rate: number;
  status_message: string;
  duration_minutes?: number;
} {
  const successRate = batch.total_recipients > 0 
    ? (batch.sent_count / batch.total_recipients) * 100 
    : 0;

  let statusMessage = '';
  let durationMinutes: number | undefined;

  switch (batch.status) {
    case 'draft':
      statusMessage = 'Batch is in draft state';
      break;
    case 'sending':
      statusMessage = `Sending notifications (${batch.sent_count}/${batch.total_recipients})`;
      break;
    case 'completed':
      statusMessage = batch.failed_count > 0 
        ? `Completed with ${batch.failed_count} failures`
        : 'All notifications sent successfully';
      
      if (batch.started_at && batch.completed_at) {
        const duration = new Date(batch.completed_at).getTime() - new Date(batch.started_at).getTime();
        durationMinutes = Math.round(duration / (1000 * 60));
      }
      break;
    case 'failed':
      statusMessage = 'Batch processing failed';
      break;
  }

  return {
    success_rate: Math.round(successRate * 10) / 10,
    status_message: statusMessage,
    duration_minutes: durationMinutes,
  };
}

/**
 * Validates notification rule conditions
 */
export function validateNotificationRule(rule: NotificationRule): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!rule.name?.trim()) {
    errors.push('Rule name is required');
  }

  if (!rule.type) {
    errors.push('Notification type is required');
  }

  if (!rule.trigger_event?.trim()) {
    errors.push('Trigger event is required');
  }

  if (!rule.template_id?.trim()) {
    errors.push('Template ID is required');
  }

  if (!rule.target_roles || rule.target_roles.length === 0) {
    errors.push('At least one target role is required');
  }

  if (!rule.channels || rule.channels.length === 0) {
    errors.push('At least one delivery channel is required');
  }

  // Validate conditions
  rule.conditions.forEach((condition, index) => {
    if (!condition.field?.trim()) {
      errors.push(`Condition ${index + 1}: Field is required`);
    }
    
    if (!condition.operator) {
      errors.push(`Condition ${index + 1}: Operator is required`);
    }
    
    if (condition.value === undefined || condition.value === null || condition.value === '') {
      errors.push(`Condition ${index + 1}: Value is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Exports notification data to different formats
 */
export function exportNotificationData(
  notifications: Notification[],
  format: 'csv' | 'json' | 'excel'
): { data: string; filename: string; mimeType: string } {
  const timestamp = new Date().toISOString().split('T')[0];
  
  switch (format) {
    case 'csv':
      const csvHeaders = [
        'ID', 'Title', 'Type', 'Priority', 'Status', 'Recipient', 
        'Sender', 'Created At', 'Read At', 'Requires Action'
      ];
      
      const csvRows = notifications.map(n => [
        n.id,
        `"${n.title.replace(/"/g, '""')}"`,
        n.type,
        n.priority,
        n.status,
        n.recipient_name,
        n.sender_name || '',
        n.created_at,
        n.read_at || '',
        n.requires_action ? 'Yes' : 'No'
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.join(','))
        .join('\n');
      
      return {
        data: csvContent,
        filename: `notifications_${timestamp}.csv`,
        mimeType: 'text/csv'
      };

    case 'json':
      return {
        data: JSON.stringify(notifications, null, 2),
        filename: `notifications_${timestamp}.json`,
        mimeType: 'application/json'
      };

    case 'excel':
      // For Excel, we'll return JSON format as a placeholder
      // In a real implementation, you'd use a library like xlsx
      return {
        data: JSON.stringify(notifications, null, 2),
        filename: `notifications_${timestamp}.xlsx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}
