export type NotificationType = 
  | 'system'
  | 'leave_request'
  | 'attendance'
  | 'payroll'
  | 'document'
  | 'announcement'
  | 'reminder'
  | 'approval'
  | 'alert'
  | 'birthday'
  | 'holiday'
  | 'policy';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationStatus = 'unread' | 'read' | 'archived';

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  
  // Recipients
  recipient_id: string;
  recipient_name: string;
  recipient_email: string;
  
  // Sender information
  sender_id?: string;
  sender_name?: string;
  sender_role?: string;
  
  // Notification metadata
  channels: NotificationChannel[];
  is_broadcast: boolean;
  
  // Action related
  action_url?: string;
  action_label?: string;
  requires_action: boolean;
  
  // Scheduling
  scheduled_at?: string;
  expires_at?: string;
  
  // Tracking
  read_at?: string;
  archived_at?: string;
  clicked_at?: string;
  
  // Additional data
  metadata?: Record<string, any>;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type: NotificationType;
  subject_template: string;
  message_template: string;
  default_channels: NotificationChannel[];
  default_priority: NotificationPriority;
  variables: string[];
  is_system: boolean;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  type: NotificationType;
  trigger_event: string;
  conditions: NotificationCondition[];
  template_id: string;
  target_roles: ('admin' | 'hr' | 'manager' | 'employee')[];
  target_departments?: string[];
  target_employees?: string[];
  channels: NotificationChannel[];
  priority: NotificationPriority;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface NotificationBatch {
  id: string;
  name: string;
  description?: string;
  type: NotificationType;
  template_id: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  status: 'draft' | 'sending' | 'completed' | 'failed';
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  
  // Type-specific preferences
  notification_types: Record<NotificationType, {
    enabled: boolean;
    channels: NotificationChannel[];
    priority_threshold: NotificationPriority;
  }>;
  
  // Quiet hours
  quiet_hours_enabled: boolean;
  quiet_hours_start: string; // HH:mm format
  quiet_hours_end: string;   // HH:mm format
  
  // Frequency settings
  digest_enabled: boolean;
  digest_frequency: 'daily' | 'weekly';
  digest_time: string; // HH:mm format
  
  updated_at: string;
}

export interface NotificationStats {
  total_notifications: number;
  unread_count: number;
  read_count: number;
  archived_count: number;
  notifications_by_type: Record<NotificationType, number>;
  notifications_by_priority: Record<NotificationPriority, number>;
  recent_notifications: number;
  click_through_rate: number;
  average_read_time: number; // in minutes
}

export interface NotificationCreateRequest {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  
  // Recipients
  recipient_ids?: string[];
  recipient_roles?: ('admin' | 'hr' | 'manager' | 'employee')[];
  recipient_departments?: string[];
  is_broadcast?: boolean;
  
  // Delivery options
  channels: NotificationChannel[];
  scheduled_at?: string;
  expires_at?: string;
  
  // Action
  action_url?: string;
  action_label?: string;
  requires_action?: boolean;
  
  // Additional data
  metadata?: Record<string, any>;
}

export const NOTIFICATION_TYPES: Record<NotificationType, {
  name: string;
  description: string;
  icon: string;
  color: string;
  default_priority: NotificationPriority;
}> = {
  system: {
    name: 'System',
    description: 'System maintenance and updates',
    icon: 'Settings',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    default_priority: 'medium',
  },
  leave_request: {
    name: 'Leave Request',
    description: 'Leave applications and approvals',
    icon: 'Calendar',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    default_priority: 'medium',
  },
  attendance: {
    name: 'Attendance',
    description: 'Attendance tracking and alerts',
    icon: 'Clock',
    color: 'bg-green-100 text-green-800 border-green-200',
    default_priority: 'low',
  },
  payroll: {
    name: 'Payroll',
    description: 'Salary and payroll notifications',
    icon: 'DollarSign',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    default_priority: 'high',
  },
  document: {
    name: 'Document',
    description: 'Document sharing and updates',
    icon: 'FileText',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    default_priority: 'medium',
  },
  announcement: {
    name: 'Announcement',
    description: 'Company announcements and news',
    icon: 'Megaphone',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    default_priority: 'medium',
  },
  reminder: {
    name: 'Reminder',
    description: 'Task and deadline reminders',
    icon: 'Bell',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    default_priority: 'low',
  },
  approval: {
    name: 'Approval',
    description: 'Approval requests and decisions',
    icon: 'CheckCircle',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    default_priority: 'high',
  },
  alert: {
    name: 'Alert',
    description: 'Important alerts and warnings',
    icon: 'AlertTriangle',
    color: 'bg-red-100 text-red-800 border-red-200',
    default_priority: 'urgent',
  },
  birthday: {
    name: 'Birthday',
    description: 'Employee birthday celebrations',
    icon: 'Gift',
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    default_priority: 'low',
  },
  holiday: {
    name: 'Holiday',
    description: 'Holiday and event notifications',
    icon: 'Calendar',
    color: 'bg-teal-100 text-teal-800 border-teal-200',
    default_priority: 'low',
  },
  policy: {
    name: 'Policy',
    description: 'Policy updates and compliance',
    icon: 'Shield',
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    default_priority: 'medium',
  },
};

export const NOTIFICATION_PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200',
};

export const NOTIFICATION_STATUS_COLORS = {
  unread: 'bg-blue-100 text-blue-800 border-blue-200',
  read: 'bg-gray-100 text-gray-800 border-gray-200',
  archived: 'bg-slate-100 text-slate-800 border-slate-200',
};

export const NOTIFICATION_CHANNELS = [
  { value: 'in_app', label: 'In-App', description: 'Show in application notifications' },
  { value: 'email', label: 'Email', description: 'Send via email' },
  { value: 'sms', label: 'SMS', description: 'Send via text message' },
  { value: 'push', label: 'Push', description: 'Send push notification' },
];

/**
 * Utility function to get notification type icon
 */
export function getNotificationTypeIcon(type: NotificationType): string {
  return NOTIFICATION_TYPES[type]?.icon || 'Bell';
}

/**
 * Utility function to get notification type color
 */
export function getNotificationTypeColor(type: NotificationType): string {
  return NOTIFICATION_TYPES[type]?.color || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Utility function to format notification time
 */
export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  } else if (diffInMinutes < 10080) { // 7 days
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

/**
 * Utility function to check if notification is recent (within 24 hours)
 */
export function isRecentNotification(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return diffInHours <= 24;
}

/**
 * Utility function to get priority level number for sorting
 */
export function getPriorityLevel(priority: NotificationPriority): number {
  const levels = { urgent: 4, high: 3, medium: 2, low: 1 };
  return levels[priority] || 1;
}

/**
 * Utility function to filter notifications based on user preferences
 */
export function shouldShowNotification(
  notification: Notification,
  preferences: NotificationPreferences
): boolean {
  const typePrefs = preferences.notification_types[notification.type];
  
  if (!typePrefs?.enabled) {
    return false;
  }
  
  const priorityLevel = getPriorityLevel(notification.priority);
  const thresholdLevel = getPriorityLevel(typePrefs.priority_threshold);
  
  return priorityLevel >= thresholdLevel;
}
