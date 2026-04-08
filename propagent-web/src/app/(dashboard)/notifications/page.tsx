'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Settings, 
  Check, 
  CheckCheck,
  Trash2,
  Filter,
  Search,
  Clock,
  AlertTriangle,
  Home,
  DollarSign,
  Users,
  Wrench,
  FileText,
  Target,
  TrendingUp,
  X
} from 'lucide-react';
import { Card, Button, Badge, Input, Avatar, EmptyState } from '@/components/ui';
import { 
  Notification, 
  NotificationType, 
  NotificationPreferences,
  NotificationPriority,
  getUserNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  formatNotificationTime,
  getNotificationIcon,
  NotificationChannel
} from '@/lib/notifications';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
    </div>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-lime-400 to-sky-400"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            opacity: 0.6,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
      `}</style>
    </div>
  );
}

type FilterType = 'all' | 'unread' | NotificationType;

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  lease_reminder: 'Lease Reminder',
  viewing_invite: 'Viewing Invite',
  payment_due: 'Payment Due',
  payment_received: 'Payment Received',
  maintenance_update: 'Maintenance',
  new_lead: 'New Lead',
  document_expiry: 'Document Expiry',
  commission_update: 'Commission',
  lease_expiry: 'Lease Expiry',
  tenant_application: 'Application',
  property_match: 'Property Match',
  system_alert: 'System Alert',
};

const NOTIFICATION_TYPE_ICONS: Record<NotificationType, typeof Home> = {
  lease_reminder: FileText,
  viewing_invite: Home,
  payment_due: DollarSign,
  payment_received: DollarSign,
  maintenance_update: Wrench,
  new_lead: Users,
  document_expiry: AlertTriangle,
  commission_update: TrendingUp,
  lease_expiry: Clock,
  tenant_application: Users,
  property_match: Target,
  system_alert: Bell,
};

const sampleNotifications: Notification[] = [
  {
    id: '1',
    userId: 'user1',
    userType: 'agent',
    type: 'new_lead',
    title: 'New Lead Alert',
    message: 'Sarah Johnson is looking for a 2-bedroom apartment in Sandton with a budget of R15,000 - R20,000. Immediate move-in required.',
    channel: 'in_app',
    priority: 'high',
    read: false,
    actionUrl: '/leads',
    metadata: { tenantName: 'Sarah Johnson', budget: 'R15,000 - R20,000', location: 'Sandton' },
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    userId: 'user1',
    userType: 'agent',
    type: 'payment_received',
    title: 'Payment Received',
    message: 'Rent payment of R18,500 received from tenant at 42 Oak Street. Reference: OCT2024-001',
    channel: 'email',
    priority: 'medium',
    read: false,
    actionUrl: '/financials',
    metadata: { amount: 18500, property: '42 Oak Street' },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '3',
    userId: 'user1',
    userType: 'agent',
    type: 'maintenance_update',
    title: 'Maintenance Request Update',
    message: 'Plumbing issue at Unit 5B has been scheduled for tomorrow between 9 AM - 12 PM.',
    channel: 'in_app',
    priority: 'low',
    read: true,
    readAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    actionUrl: '/maintenance',
    metadata: { requestId: 'MNT-004', status: 'scheduled' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '4',
    userId: 'user1',
    userType: 'agent',
    type: 'document_expiry',
    title: 'Document Expiring Soon',
    message: 'Your Professional Fidelity Fund certificate expires in 7 days. Please upload the renewed document.',
    channel: 'email',
    priority: 'urgent',
    read: true,
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    actionUrl: '/agents',
    metadata: { documentType: 'PFF Certificate', daysRemaining: 7 },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '5',
    userId: 'user1',
    userType: 'agent',
    type: 'lease_expiry',
    title: 'Lease Expiry Notice',
    message: 'Lease for Property 123 Main Street expires in 30 days. Tenant has indicated they wish to renew.',
    channel: 'in_app',
    priority: 'medium',
    read: true,
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    actionUrl: '/tenants',
    metadata: { property: '123 Main Street', daysRemaining: 30 },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: '6',
    userId: 'user1',
    userType: 'agent',
    type: 'commission_update',
    title: 'Commission Processed',
    message: 'Your commission of R12,500 for the property sale at 89 Willow Road has been processed and will reflect in your account within 2-3 business days.',
    channel: 'email',
    priority: 'low',
    read: false,
    actionUrl: '/financials',
    metadata: { amount: 12500, property: '89 Willow Road' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

const samplePreferences: NotificationPreferences = {
  id: 'pref1',
  userId: 'user1',
  emailEnabled: true,
  smsEnabled: true,
  inAppEnabled: true,
  pushEnabled: false,
  leaseReminders: true,
  paymentAlerts: true,
  maintenanceUpdates: true,
  marketingEmails: false,
  viewingInvites: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [preferences, setPreferences] = useState<NotificationPreferences>(samplePreferences);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (pageRef.current) {
      observer.observe(pageRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        n => 
          n.title.toLowerCase().includes(query) || 
          n.message.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [notifications, filter, searchQuery]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, read: true, readAt: new Date().toISOString() }
          : n
      )
    );
    if (selectedNotification?.id === notificationId) {
      setSelectedNotification(prev => prev ? { ...prev, read: true } : null);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(user?.id || 'user1');
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
    );
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (selectedNotification?.id === notificationId) {
      setSelectedNotification(null);
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean | string) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    setSavingPrefs(true);
    await updateNotificationPreferences(user?.id || 'user1', { [key]: value });
    setSavingPrefs(false);
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    const badgeClasses = {
      urgent: "bg-white border-2 border-charcoal-100 rounded-2xl bg-red-500/20 text-red-300 border-red-500/30",
      high: "bg-white border-2 border-charcoal-100 rounded-2xl bg-orange-500/20 text-orange-300 border-orange-500/30",
      medium: "bg-white border-2 border-charcoal-100 rounded-2xl bg-blue-500/20 text-blue-300 border-blue-500/30",
      low: "bg-white border-2 border-charcoal-100 rounded-2xl bg-charcoal-500/20 text-charcoal-500 border-charcoal-500/30",
    };
    
    switch (priority) {
      case 'urgent':
        return <Badge className={cn("gap-1", badgeClasses.urgent)}>Urgent</Badge>;
      case 'high':
        return <Badge className={cn("gap-1", badgeClasses.high)}>High</Badge>;
      case 'medium':
        return <Badge className={cn("gap-1", badgeClasses.medium)}>Medium</Badge>;
      default:
        return <Badge className={cn("gap-1", badgeClasses.low)}>Low</Badge>;
    }
  };

  const statCards = [
    { icon: <Bell className="w-5 h-5 text-blue-400" />, value: notifications.length, label: 'Total', color: 'blue' },
    { icon: <AlertTriangle className="w-5 h-5 text-lime-400" />, value: unreadCount, label: 'Unread', color: 'amber' },
    { icon: <Mail className="w-5 h-5 text-sky-400" />, value: notifications.filter(n => n.channel === 'email').length, label: 'Email', color: 'emerald' },
    { icon: <MessageSquare className="w-5 h-5 text-purple-400" />, value: notifications.filter(n => n.channel === 'sms').length, label: 'SMS', color: 'purple' },
  ];

  return (
    <div ref={pageRef} className="space-y-6 relative">
      {/* Animated Gradient Header */}
      <div className="bg-white relative rounded-2xl p-6 overflow-hidden border-2 border-charcoal-100">
        <AnimatedBackground />
        <FloatingParticles />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-charcoal-900 bg-gradient-to-r from-lime-400 to-sky-400 bg-clip-text text-transparent">Notifications</h1>
              <p className="text-charcoal-500 mt-1">
                {unreadCount > 0 
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'All caught up!'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="bg-white border-2 border-charcoal-100 rounded-2xl hover:bg-lime-400/20">
                  <CheckCheck className="w-4 h-4 mr-2 text-lime-400" />
                  <span className="text-lime-400">Mark all read</span>
                </Button>
              )}
              <Button 
                variant={showSettings ? 'primary' : 'outline'} 
                size="sm" 
                onClick={() => setShowSettings(!showSettings)}
                className={showSettings ? "bg-lime-400 text-charcoal-900 rounded-full" : "bg-white border-2 border-charcoal-100 rounded-2xl hover:bg-lime-400/20"}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showSettings ? (
        <div className={cn("bg-white border-2 border-charcoal-100 rounded-2xl", isVisible && "animate-on-scroll visible")}>
          <div className="flex items-center gap-3 mb-6 p-4 border-b border-charcoal-100">
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-charcoal-100 rounded-2xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <h2 className="font-semibold text-charcoal-900">Notification Preferences</h2>
              <p className="text-sm text-charcoal-500">Manage how you receive notifications</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div className="space-y-4">
              <h3 className="font-medium text-lime-400">Notification Channels</h3>
              <div className="space-y-3">
                {[
                  { key: 'emailEnabled' as const, label: 'Email Notifications', icon: Mail, desc: 'Receive notifications via email' },
                  { key: 'smsEnabled' as const, label: 'SMS Notifications', icon: MessageSquare, desc: 'Receive notifications via text message' },
                  { key: 'inAppEnabled' as const, label: 'In-App Notifications', icon: Bell, desc: 'Show notifications in the app' },
                ].map(({ key, label, icon: Icon, desc }) => (
                  <label key={key} className="flex items-center justify-between p-3 rounded-lg border border-charcoal-100 hover:bg-charcoal-100/50 cursor-pointer bg-white border-2 border-charcoal-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-lime-400" />
                      <div>
                        <p className="font-medium text-charcoal-900">{label}</p>
                        <p className="text-xs text-charcoal-500">{desc}</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences[key]}
                      onChange={(e) => handlePreferenceChange(key, e.target.checked)}
                      className="w-4 h-4 text-lime-400 rounded border-lime-400/30 focus:ring-lime-400"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-lime-400">Notification Types</h3>
              <div className="space-y-3">
                {[
                  { key: 'leaseReminders' as const, label: 'Lease Reminders', desc: 'Expiry and renewal reminders' },
                  { key: 'paymentAlerts' as const, label: 'Payment Alerts', desc: 'Due dates and payment confirmations' },
                  { key: 'maintenanceUpdates' as const, label: 'Maintenance Updates', desc: 'Request status changes' },
                  { key: 'viewingInvites' as const, label: 'Viewing Invites', desc: 'Property viewing notifications' },
                  { key: 'marketingEmails' as const, label: 'Marketing Emails', desc: 'Tips and product updates' },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-center justify-between p-3 rounded-lg border border-charcoal-100 hover:bg-charcoal-100/50 cursor-pointer bg-white border-2 border-charcoal-100 rounded-2xl">
                    <div>
                      <p className="font-medium text-charcoal-900">{label}</p>
                      <p className="text-xs text-charcoal-500">{desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences[key]}
                      onChange={(e) => handlePreferenceChange(key, e.target.checked)}
                      className="w-4 h-4 text-lime-400 rounded border-lime-400/30 focus:ring-lime-400"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-charcoal-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-lime-400">Quiet Hours</h3>
                <p className="text-sm text-charcoal-500">Pause non-urgent notifications during specific hours</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-charcoal-500">Enable</span>
                <input
                  type="checkbox"
                  checked={preferences.quietHoursEnabled}
                  onChange={(e) => handlePreferenceChange('quietHoursEnabled', e.target.checked)}
                  className="w-4 h-4 text-lime-400 rounded border-lime-400/30 focus:ring-lime-400"
                />
              </label>
            </div>
            {preferences.quietHoursEnabled && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-charcoal-500">Start:</label>
                  <input
                    type="time"
                    value={preferences.quietHoursStart || '22:00'}
                    onChange={(e) => handlePreferenceChange('quietHoursStart', e.target.value)}
                    className="px-3 py-2 bg-charcoal-100/50 border border-lime-400/30 rounded-lg text-sm text-charcoal-900"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-charcoal-500">End:</label>
                  <input
                    type="time"
                    value={preferences.quietHoursEnd || '07:00'}
                    onChange={(e) => handlePreferenceChange('quietHoursEnd', e.target.value)}
                    className="px-3 py-2 bg-charcoal-100/50 border border-lime-400/30 rounded-lg text-sm text-charcoal-900"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-white border-2 border-charcoal-100 rounded-2xl rounded-lg border border-charcoal-100">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-charcoal-900">POPIA Compliance</p>
                <p className="text-sm text-charcoal-500 mt-1">
                  Your notification preferences are stored securely and you can opt-out of any notification type at any time. 
                  We only send notifications you have consented to receive.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={cn("bg-white border-2 border-charcoal-100 rounded-2xl overflow-hidden lg:col-span-2", isVisible && "animate-on-scroll visible")}>
            <div className="p-4 border-b border-charcoal-100 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-charcoal-100/50 border border-lime-400/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 text-charcoal-900 placeholder-charcoal-400"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {(['all', 'unread', 'payment_due', 'maintenance_update', 'new_lead', 'lease_expiry'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300",
                      filter === f 
                        ? "bg-gradient-to-r from-lime-400 to-sky-400 text-charcoal-900 shadow-lg" 
                        : "bg-charcoal-100/50 text-charcoal-500 hover:bg-charcoal-50/50 border border-charcoal-100"
                    )}
                  >
                    {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : NOTIFICATION_TYPE_LABELS[f as NotificationType]}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-lime-400/10">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-12 h-12 text-charcoal-600 mx-auto mb-3" />
                  <p className="text-charcoal-500">No notifications found</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const IconComponent = NOTIFICATION_TYPE_ICONS[notification.type] || Bell;
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 hover:bg-charcoal-100/30 cursor-pointer transition-colors",
                        !notification.read && "bg-lime-400/5"
                      )}
                      onClick={() => {
                        setSelectedNotification(notification);
                        if (!notification.read) {
                          handleMarkAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-white border-2 border-charcoal-100 rounded-2xl",
                          !notification.read ? "bg-lime-400/20" : "bg-charcoal-100/50"
                        )}>
                          <IconComponent className={cn(
                            "w-5 h-5",
                            !notification.read ? "text-lime-400" : "text-charcoal-500"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={cn(
                              "font-medium text-sm",
                              !notification.read ? "text-charcoal-900" : "text-charcoal-500"
                            )}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-lime-400 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-charcoal-500 line-clamp-2">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-charcoal-500">
                              {formatNotificationTime(notification.createdAt)}
                            </span>
                            {notification.priority === 'urgent' && (
                              <Badge className="text-xs bg-white border-2 border-charcoal-100 rounded-2xl bg-red-500/20 text-red-300 border-red-500/30">Urgent</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className={cn("bg-white border-2 border-charcoal-100 rounded-2xl p-4", isVisible && "animate-on-scroll visible delay-200")}>
            {selectedNotification ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl text-lime-400">{getNotificationIcon(selectedNotification.type)}</span>
                    <Badge className="bg-white border-2 border-charcoal-100 rounded-2xl bg-charcoal-500/20 text-charcoal-500 border-charcoal-500/30">
                      {NOTIFICATION_TYPE_LABELS[selectedNotification.type]}
                    </Badge>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedNotification.id)}
                    className="p-2 text-charcoal-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="font-semibold text-charcoal-900">{selectedNotification.title}</h3>
                  <p className="text-sm text-charcoal-500 mt-1">
                    {formatNotificationTime(selectedNotification.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {getPriorityBadge(selectedNotification.priority)}
                  <Badge className="bg-white border-2 border-charcoal-100 rounded-2xl bg-charcoal-500/20 text-charcoal-500 border-charcoal-500/30 gap-1 capitalize">
                    {selectedNotification.channel === 'in_app' ? 'In-App' : selectedNotification.channel}
                  </Badge>
                </div>

                <div className="p-4 bg-white border-2 border-charcoal-100 rounded-2xl">
                  <p className="text-sm text-charcoal-500 whitespace-pre-wrap">{selectedNotification.message}</p>
                </div>

                {selectedNotification.metadata && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-lime-400 uppercase">Additional Details</p>
                    <div className="space-y-1">
                      {Object.entries(selectedNotification.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-charcoal-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-charcoal-500 font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNotification.actionUrl && (
                  <Button className="w-full bg-lime-400 text-charcoal-900 rounded-full">
                    View Details
                  </Button>
                )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Bell className="w-12 h-12 text-charcoal-600 mx-auto mb-3" />
                <p className="text-charcoal-500">Select a notification to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", isVisible && "animate-on-scroll visible stagger-children")}>
        {statCards.map((stat, idx) => (
          <div 
            key={stat.label} 
            className={cn(
              "bg-white border-2 border-charcoal-100 rounded-2xl hover:scale-105 p-4",
              isVisible && "animate-on-scroll"
            )}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border-2 border-charcoal-100 rounded-2xl flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">{stat.value}</p>
                <p className="text-xs text-charcoal-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}