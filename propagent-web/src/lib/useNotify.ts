'use client';

// Hook that creates an in-app notification AND (if the recipient has opted in)
// fires a matching email through /api/email/notification.
//
// This is the single entry point app pages should use when an event worth
// telling the user about happens (new tenant, new maintenance ticket, new
// lead, etc.) — it keeps in-app + email in sync and respects per-type prefs.

import { useCallback } from 'react';
import { useAuth } from './auth';
import {
  useCollection,
  useLocalStorageState,
  newId,
} from './persistence';
import type {
  Notification,
  NotificationChannel,
  NotificationPreferences,
  NotificationPriority,
  NotificationType,
} from './notifications';
import { sendNotificationEmail } from './email-client';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  id: 'pref-current',
  userId: 'current',
  emailEnabled: true,
  smsEnabled: false,
  inAppEnabled: true,
  pushEnabled: false,
  leaseReminders: true,
  paymentAlerts: true,
  maintenanceUpdates: true,
  marketingEmails: false,
  viewingInvites: true,
  quietHoursEnabled: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Map a notification type onto the per-category opt-in flag in preferences.
// Types that don't map to an explicit toggle fall through to emailEnabled.
function typeCategoryAllowed(
  type: NotificationType,
  prefs: NotificationPreferences,
): boolean {
  switch (type) {
    case 'lease_reminder':
    case 'lease_expiry':
      return prefs.leaseReminders;
    case 'payment_due':
    case 'payment_received':
    case 'commission_update':
      return prefs.paymentAlerts;
    case 'maintenance_update':
      return prefs.maintenanceUpdates;
    case 'viewing_invite':
      return prefs.viewingInvites;
    default:
      return true;
  }
}

export type NotifyInput = {
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  channel?: NotificationChannel;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  /**
   * When provided, an email is sent to this recipient in addition to the
   * in-app notification (subject to the current user's preferences).
   */
  email?: {
    to: string;
    recipientName: string;
    actionLabel?: string;
  };
};

export function useNotify() {
  const { user, profile } = useAuth();
  const { add } = useCollection<Notification>('notifications', []);
  const [preferences] = useLocalStorageState<NotificationPreferences>(
    'notification_preferences',
    DEFAULT_PREFERENCES,
  );

  return useCallback(
    (input: NotifyInput) => {
      const now = new Date().toISOString();
      const notification: Notification = {
        id: newId('notif'),
        userId: user?.id ?? profile?.id ?? 'current',
        userType: 'agent',
        type: input.type,
        title: input.title,
        message: input.message,
        channel: input.channel ?? 'in_app',
        priority: input.priority ?? 'medium',
        read: false,
        actionUrl: input.actionUrl,
        metadata: input.metadata,
        createdAt: now,
      };
      add(notification);

      if (
        input.email &&
        preferences.emailEnabled &&
        typeCategoryAllowed(input.type, preferences)
      ) {
        const origin =
          typeof window !== 'undefined' ? window.location.origin : '';
        const fullActionUrl = input.actionUrl
          ? input.actionUrl.startsWith('http')
            ? input.actionUrl
            : `${origin}${input.actionUrl}`
          : undefined;
        void sendNotificationEmail({
          to: input.email.to,
          recipientName: input.email.recipientName,
          title: input.title,
          message: input.message,
          actionUrl: fullActionUrl,
          actionLabel: input.email.actionLabel,
        });
      }
    },
    [add, preferences, user, profile],
  );
}
