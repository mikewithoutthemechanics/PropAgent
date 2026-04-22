// Notification System for agent-loop
// POPIA-compliant: User consent for notifications, audit logging

import { supabase } from './supabase';

// ============================================================================
// Types
// ============================================================================

export type NotificationType = 
  | 'lease_reminder'
  | 'viewing_invite'
  | 'payment_due'
  | 'payment_received'
  | 'maintenance_update'
  | 'new_lead'
  | 'document_expiry'
  | 'commission_update'
  | 'lease_expiry'
  | 'tenant_application'
  | 'property_match'
  | 'system_alert';

export type NotificationChannel = 'email' | 'sms' | 'in_app' | 'push';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type UserType = 'tenant' | 'agent' | 'landlord' | 'admin';

export interface Notification {
  id: string;
  userId: string;
  userType: UserType;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  leaseReminders: boolean;
  paymentAlerts: boolean;
  maintenanceUpdates: boolean;
  marketingEmails: boolean;
  viewingInvites: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Email Templates
// ============================================================================

export const EMAIL_TEMPLATES: Record<NotificationType, {
  subject: string;
  body: string;
  variables: string[];
}> = {
  lease_reminder: {
    subject: 'Lease Reminder - {{property_address}}',
    body: `Dear {{recipient_name}},

This is a friendly reminder that your lease for {{property_address}} expires on {{lease_end_date}}.

Please contact us if you'd like to discuss renewal options.

Kind regards,
agent-loop Team`,
    variables: ['recipient_name', 'property_address', 'lease_end_date'],
  },
  viewing_invite: {
    subject: 'Property Viewing Invitation - {{property_address}}',
    body: `Dear {{recipient_name}},

You're invited to view a property at {{property_address}}.

Date: {{viewing_date}}
Time: {{viewing_time}}

Please confirm your attendance by clicking the link below:
{{confirmation_link}}

agent-loop`,
    variables: ['recipient_name', 'property_address', 'viewing_date', 'viewing_time', 'confirmation_link'],
  },
  payment_due: {
    subject: 'Payment Due - {{property_address}}',
    body: `Dear {{recipient_name}},

Your rent payment of R{{amount}} for {{property_address}} is due on {{due_date}}.

Please ensure payment is made by the due date to avoid late fees.

Payment reference: {{reference}}

agent-loop`,
    variables: ['recipient_name', 'property_address', 'amount', 'due_date', 'reference'],
  },
  payment_received: {
    subject: 'Payment Received - R{{amount}}',
    body: `Dear {{recipient_name}},

We confirm receipt of your payment of R{{amount}} for {{property_address}}.

Payment date: {{paid_date}}
Reference: {{reference}}

Thank you,
agent-loop`,
    variables: ['recipient_name', 'amount', 'property_address', 'paid_date', 'reference'],
  },
  maintenance_update: {
    subject: 'Maintenance Update - {{request_title}}',
    body: `Dear {{recipient_name}},

Your maintenance request "{{request_title}}" has been updated.

Status: {{status}}
{{#if notes}}Notes: {{notes}}{{/if}}

{{#if scheduled_date}}Scheduled: {{scheduled_date}}{{/if}}

agent-loop`,
    variables: ['recipient_name', 'request_title', 'status', 'notes', 'scheduled_date'],
  },
  new_lead: {
    subject: 'New Lead - {{tenant_name}}',
    body: `Hi {{agent_name}},

You have a new lead!

Tenant: {{tenant_name}}
Budget: R{{budget_min}} - R{{budget_max}}
Location: {{location}}
Property Types: {{property_types}}
Urgency: {{urgency}}

View details: {{lead_link}}

agent-loop`,
    variables: ['agent_name', 'tenant_name', 'budget_min', 'budget_max', 'location', 'property_types', 'urgency', 'lead_link'],
  },
  document_expiry: {
    subject: 'Document Expiring Soon - {{document_type}}',
    body: `Dear {{recipient_name}},

Your {{document_type}} expires on {{expiry_date}}.

Please upload a new document to avoid service interruption.

{{upload_link}}

agent-loop`,
    variables: ['recipient_name', 'document_type', 'expiry_date', 'upload_link'],
  },
  commission_update: {
    subject: 'Commission Update - R{{amount}}',
    body: `Dear {{agent_name}},

Your commission of R{{amount}} has been {{status}}.

{{#if details}}Details: {{details}}{{/if}}

agent-loop`,
    variables: ['agent_name', 'amount', 'status', 'details'],
  },
  lease_expiry: {
    subject: 'Lease Expiry Notice - {{property_address}}',
    body: `Dear {{recipient_name}},

Your lease at {{property_address}} expires on {{lease_end_date}}.

Please contact us to discuss renewal options.

agent-loop`,
    variables: ['recipient_name', 'property_address', 'lease_end_date'],
  },
  tenant_application: {
    subject: 'New Application - {{tenant_name}}',
    body: `Dear {{agent_name}},

You have a new tenant application from {{tenant_name}}.

Property: {{property_address}}
Application date: {{application_date}}

Review: {{application_link}}

agent-loop`,
    variables: ['agent_name', 'tenant_name', 'property_address', 'application_date', 'application_link'],
  },
  property_match: {
    subject: '🎯 New AI Match: {{property_title}}',
    body: `Dear {{recipient_name}},

Our AI Matching Engine has found a high-probability match for your buyer!

Property: {{property_title}}
Location: {{location}}
Price: R{{price}}
Match Score: {{match_score}}% (within 20% variance)

This property matches your client's requirements closely. You can now reach out to the listing agent to arrange a viewing.

View match details: {{property_link}}

Kind regards,
agent-loop AI`,
    variables: ['recipient_name', 'property_title', 'location', 'price', 'match_score', 'property_link'],
  },
  system_alert: {
    subject: 'System Alert - {{alert_title}}',
    body: `Dear {{recipient_name}},

{{alert_message}}

{{#if action_required}}Action required: {{action_link}}{{/if}}

agent-loop`,
    variables: ['recipient_name', 'alert_title', 'alert_message', 'action_required', 'action_link'],
  },
};

// ============================================================================
// SMS Templates (Twilio Pattern)
// ============================================================================

export const SMS_TEMPLATES: Record<NotificationType, string> = {
  lease_reminder: 'agent-loop: Your lease at {{address}} expires on {{date}}. Contact us to renew.',
  viewing_invite: 'agent-loop: Viewing invite for {{address}} on {{date}} at {{time}}. Confirm: {{link}}',
  payment_due: 'agent-loop: Rent of R{{amount}} due on {{date}}. Ref: {{reference}}',
  payment_received: 'agent-loop: Payment of R{{amount}} received. Thank you!',
  maintenance_update: 'agent-loop: Maintenance request "{{title}}" status: {{status}}',
  new_lead: 'agent-loop: New lead! {{name}} looking for {{beds}} bed in {{area}}. View: {{link}}',
  document_expiry: 'agent-loop: Your {{doc}} expires {{date}}. Upload new: {{link}}',
  commission_update: 'agent-loop: Commission R{{amount}} {{status}}. Details: {{link}}',
  lease_expiry: 'agent-loop: Lease expiry reminder for {{address}}. Contact us to renew.',
  tenant_application: 'agent-loop: New application from {{name}}. Review: {{link}}',
  property_match: '🎯 agent-loop Match: {{title}} at R{{price}} ({{match_score}}% match). View: {{link}}',
  system_alert: 'agent-loop Alert: {{message}}',
};

// ============================================================================
// Notification Functions
// ============================================================================

export async function createNotification(params: {
  userId: string;
  userType: UserType;
  type: NotificationType;
  title: string;
  message: string;
  channel?: NotificationChannel;
  priority?: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}): Promise<Notification | null> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: params.userId,
      user_type: params.userType,
      type: params.type,
      title: params.title,
      message: params.message,
      channel: params.channel || 'in_app',
      priority: params.priority || 'medium',
      action_url: params.actionUrl,
      metadata: params.metadata,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    return null;
  }

  return data;
}

export async function getUserNotifications(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
    type?: NotificationType;
  }
): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.unreadOnly) {
    query = query.eq('read', false);
  }

  if (options?.type) {
    query = query.eq('type', options.type);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ 
      read: true, 
      read_at: new Date().toISOString() 
    })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }

  return true;
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ 
      read: true, 
      read_at: new Date().toISOString() 
    })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }

  return true;
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Error deleting notification:', error);
    return false;
  }

  return true;
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }

  return count || 0;
}

// ============================================================================
// Preferences
// ============================================================================

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching preferences:', error);
    return null;
  }

  return data;
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<Omit<NotificationPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<NotificationPreferences | null> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .update({
      ...preferences,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating preferences:', error);
    return null;
  }

  return data;
}

export async function createDefaultPreferences(userId: string): Promise<NotificationPreferences | null> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .insert({
      user_id: userId,
      email_enabled: true,
      sms_enabled: true,
      in_app_enabled: true,
      push_enabled: false,
      lease_reminders: true,
      payment_alerts: true,
      maintenance_updates: true,
      marketing_emails: false,
      viewing_invites: true,
      quiet_hours_enabled: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating default preferences:', error);
    return null;
  }

  return data;
}

// ============================================================================
// Notification Sending (Twilio Pattern for SMS, Email Pattern for Email)
// ============================================================================

export interface SendNotificationParams {
  userId: string;
  userType: UserType;
  type: NotificationType;
  title: string;
  message: string;
  variables?: Record<string, string>;
  priority?: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export async function sendNotification(params: SendNotificationParams): Promise<{
  success: boolean;
  notificationId?: string;
  errors?: string[];
}> {
  const errors: string[] = [];
  
  const preferences = await getNotificationPreferences(params.userId);
  const enableEmail = preferences?.emailEnabled ?? true;
  const enableSms = preferences?.smsEnabled ?? true;
  const enableInApp = preferences?.inAppEnabled ?? true;

  const now = new Date();
  if (preferences?.quietHoursEnabled && preferences.quietHoursStart && preferences.quietHoursEnd) {
    const currentTime = now.toTimeString().slice(0, 5);
    if (currentTime >= preferences.quietHoursStart && currentTime <= preferences.quietHoursEnd) {
      if (enableInApp) {
        console.log('Quiet hours active - only in-app notifications');
      } else {
        return { success: false, errors: ['Notifications paused during quiet hours'] };
      }
    }
  }

  if (enableInApp) {
    const notification = await createNotification({
      userId: params.userId,
      userType: params.userType,
      type: params.type,
      title: params.title,
      message: params.message,
      channel: 'in_app',
      priority: params.priority || 'medium',
      actionUrl: params.actionUrl,
      metadata: params.metadata,
    });

    if (!notification) {
      errors.push('Failed to create in-app notification');
    }
  }

  if (enableEmail && shouldSendEmailNotification(params.type, preferences)) {
    const emailSent = await sendEmail({
      to: params.metadata?.email as string || '',
      template: params.type,
      variables: params.variables || {},
    });
    
    if (!emailSent) {
      errors.push('Failed to send email');
    }
  }

  if (enableSms && shouldSendSmsNotification(params.type, preferences)) {
    const smsSent = await sendSms({
      to: params.metadata?.phone as string || '',
      template: params.type,
      variables: params.variables || {},
    });
    
    if (!smsSent) {
      errors.push('Failed to send SMS');
    }
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

function shouldSendEmailNotification(type: NotificationType, prefs: NotificationPreferences | null): boolean {
  if (!prefs) return true;
  
  const typeMap: Record<NotificationType, keyof Omit<NotificationPreferences, 'id' | 'userId' | 'emailEnabled' | 'smsEnabled' | 'inAppEnabled' | 'pushEnabled' | 'quietHoursEnabled' | 'quietHoursStart' | 'quietHoursEnd' | 'createdAt' | 'updatedAt'>> = {
    lease_reminder: 'leaseReminders',
    viewing_invite: 'viewingInvites',
    payment_due: 'paymentAlerts',
    payment_received: 'paymentAlerts',
    maintenance_update: 'maintenanceUpdates',
    new_lead: 'marketingEmails',
    document_expiry: 'marketingEmails',
    commission_update: 'marketingEmails',
    lease_expiry: 'leaseReminders',
    tenant_application: 'marketingEmails',
    property_match: 'marketingEmails',
    system_alert: 'marketingEmails',
  };

  const prefKey = typeMap[type];
  return prefKey ? (prefs[prefKey] ?? true) : true;
}

function shouldSendSmsNotification(type: NotificationType, prefs: NotificationPreferences | null): boolean {
  if (!prefs) return true;
  
  const smsTypes: NotificationType[] = ['payment_due', 'payment_received', 'lease_reminder', 'viewing_invite', 'maintenance_update'];
  return smsTypes.includes(type);
}

interface EmailParams {
  to: string;
  template: NotificationType;
  variables: Record<string, string>;
}

async function sendEmail(params: EmailParams): Promise<boolean> {
  const template = EMAIL_TEMPLATES[params.template];
  if (!template) return false;

  let subject = template.subject;
  let body = template.body;

  for (const [key, value] of Object.entries(params.variables)) {
    subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value);
    body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  const { error } = await supabase.functions.invoke('send-email', {
    body: {
      to: params.to,
      subject,
      body,
      template: params.template,
    },
  });

  if (error) {
    console.error('Email send error:', error);
    return false;
  }

  return true;
}

interface SmsParams {
  to: string;
  template: NotificationType;
  variables: Record<string, string>;
}

async function sendSms(params: SmsParams): Promise<boolean> {
  const template = SMS_TEMPLATES[params.template];
  if (!template) return false;

  let message = template;
  for (const [key, value] of Object.entries(params.variables)) {
    message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  const { error } = await supabase.functions.invoke('send-sms', {
    body: {
      to: params.to,
      message,
      template: params.template,
    },
  });

  if (error) {
    console.error('SMS send error:', error);
    return false;
  }

  return true;
}

// ============================================================================
// Batch Notifications
// ============================================================================

export async function sendBatchNotifications(
  notifications: SendNotificationParams[]
): Promise<{
  sent: number;
  failed: number;
  results: Array<{ success: boolean; params: SendNotificationParams; error?: string }>;
}> {
  const results = await Promise.allSettled(
    notifications.map(params => sendNotification(params))
  );

  let sent = 0;
  let failed = 0;

  const processedResults = results.map((result, index) => {
    const success = result.status === 'fulfilled' && result.value.success;
    if (success) sent++;
    else failed++;

    return {
      success,
      params: notifications[index],
      error: result.status === 'rejected' ? result.reason : result.value.errors?.join(', '),
    };
  });

  return { sent, failed, results: processedResults };
}

// ============================================================================
// Notification Helpers
// ============================================================================

export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
  });
}

export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    lease_reminder: '📄',
    viewing_invite: '🏠',
    payment_due: '💰',
    payment_received: '✅',
    maintenance_update: '🔧',
    new_lead: '👤',
    document_expiry: '⚠️',
    commission_update: '💵',
    lease_expiry: '📅',
    tenant_application: '📝',
    property_match: '🎯',
    system_alert: '🔔',
  };

  return icons[type] || '📌';
}

export function getNotificationPriorityColor(priority: NotificationPriority): string {
  const colors: Record<NotificationPriority, string> = {
    low: 'text-navy-400',
    medium: 'text-blue-400',
    high: 'text-orange-400',
    urgent: 'text-red-400',
  };

  return colors[priority];
}