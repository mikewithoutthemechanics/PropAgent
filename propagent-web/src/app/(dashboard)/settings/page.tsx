'use client';

import { useState } from 'react';
import { useLocalStorageState } from '@/lib/persistence';
import { 
  User, 
  Lock, 
  Bell, 
  Palette, 
  Building, 
  Key, 
  Shield, 
  Mail, 
  Phone, 
  MapPin,
  Save,
  Upload,
  Eye,
  EyeOff,
  Check,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
}

const tabs: Tab[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'business', label: 'Business', icon: Building },
  { id: 'api', label: 'API Keys', icon: Key },
];

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  agencyName: string;
  ffcNumber: string;
}

interface NotificationSettings {
  emailRent: boolean;
  emailMaintenance: boolean;
  emailLeads: boolean;
  emailLegal: boolean;
  pushRent: boolean;
  pushMaintenance: boolean;
  pushLeads: boolean;
  smsUrgent: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const [profile, setProfile] = useLocalStorageState<ProfileForm>('settings_profile', {
    firstName: 'Dean',
    lastName: 'Hodgson',
    email: 'dean@agentloop.co.za',
    phone: '+27827686661',
    agencyName: 'Agent Loop Consulting',
    ffcNumber: 'FFC-2024-001234',
  });

  const [notifications, setNotifications] = useLocalStorageState<NotificationSettings>('settings_notifications', {
    emailRent: true,
    emailMaintenance: true,
    emailLeads: true,
    emailLegal: true,
    pushRent: true,
    pushMaintenance: false,
    pushLeads: true,
    smsUrgent: true,
  });

  const [appearance, setAppearance] = useState({
    theme: 'light' as 'light' | 'dark' | 'system',
    compactMode: false,
    showAnimations: true,
  });

  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Production API', key: 'pk_live_xxxxx...yyyyy', created: '2024-01-15', lastUsed: '2024-03-20' },
    { id: '2', name: 'Development API', key: 'pk_test_xxxxx...yyyyy', created: '2024-02-01', lastUsed: '2024-03-18' },
  ]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <style>{`
        .settings-gradient {
          background: linear-gradient(135deg, rgba(132,204,22,0.05) 0%, rgba(14,165,233,0.05) 100%);
        }
      `}</style>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white border-2 border-charcoal-100 p-6 sm:p-8">
        <div className="settings-gradient absolute inset-0" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-lime-400" />
            <span className="text-lime-400 text-sm font-medium">Account Settings</span>
          </div>
          <h1 className="text-3xl font-bold text-charcoal-900 font-serif">Settings</h1>
          <p className="text-charcoal-500 mt-2">
            Manage your profile, security, and preferences
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border-2 border-charcoal-100 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-5 py-4 text-left transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-lime-50 text-lime-400 border-l-2 border-lime-400"
                    : "text-charcoal-500 hover:bg-charcoal-50 hover:text-charcoal-900"
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border-2 border-charcoal-100 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-charcoal-900">Profile Information</h2>
              
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-sky-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile.firstName[0]}{profile.lastName[0]}
                </div>
                <div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-lime-400 text-charcoal-900 rounded-lg font-medium text-sm hover:bg-lime-300 transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </button>
                  <p className="text-xs text-charcoal-500 mt-2">JPG, PNG up to 2MB</p>
                </div>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">First Name</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-charcoal-50 border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-charcoal-50 border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-lime-400 text-charcoal-900 rounded-lg font-medium hover:bg-lime-300 transition-colors"
                >
                  {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl border-2 border-charcoal-100 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-charcoal-900">Security Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 bg-charcoal-50 border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400/50 transition-all"
                  />
                </div>
              </div>

              {/* 2FA */}
              <div className="pt-4 border-t border-charcoal-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-charcoal-900">Two-Factor Authentication</p>
                    <p className="text-sm text-charcoal-500">Add an extra layer of security</p>
                  </div>
                  <button className="px-4 py-2 bg-charcoal-900 text-white rounded-lg font-medium text-sm hover:bg-charcoal-800 transition-colors">
                    Enable 2FA
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-lime-400 text-charcoal-900 rounded-lg font-medium hover:bg-lime-300 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Update Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border-2 border-charcoal-100 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-charcoal-900">Notification Preferences</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-charcoal-900 mb-4">Email Notifications</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'emailRent', label: 'Rent payments received', desc: 'Get notified when rent is paid' },
                      { key: 'emailMaintenance', label: 'Maintenance requests', desc: 'New maintenance tickets' },
                      { key: 'emailLeads', label: 'New leads', desc: 'New tenant inquiries' },
                      { key: 'emailLegal', label: 'Legal updates', desc: 'Compliance and legal notices' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg cursor-pointer hover:bg-charcoal-100 transition-colors">
                        <div>
                          <p className="font-medium text-charcoal-900">{item.label}</p>
                          <p className="text-sm text-charcoal-500">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof NotificationSettings] as boolean}
                          onChange={(e) => setNotifications({...notifications, [item.key]: e.target.checked})}
                          className="w-5 h-5 rounded border-charcoal-300 bg-white text-lime-400 focus:ring-lime-400/30"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-charcoal-900 mb-4">Push Notifications</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'pushRent', label: 'Rent alerts' },
                      { key: 'pushMaintenance', label: 'Maintenance updates' },
                      { key: 'pushLeads', label: 'New lead notifications' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg cursor-pointer hover:bg-charcoal-100 transition-colors">
                        <span className="font-medium text-charcoal-900">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof NotificationSettings] as boolean}
                          onChange={(e) => setNotifications({...notifications, [item.key]: e.target.checked})}
                          className="w-5 h-5 rounded border-charcoal-300 bg-white text-lime-400 focus:ring-lime-400/30"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-charcoal-900 mb-4">SMS Alerts</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg cursor-pointer hover:bg-charcoal-100 transition-colors">
                      <div>
                        <p className="font-medium text-charcoal-900">Urgent only</p>
                        <p className="text-sm text-charcoal-500">Only critical alerts via SMS</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.smsUrgent}
                        onChange={(e) => setNotifications({...notifications, smsUrgent: e.target.checked})}
                        className="w-5 h-5 rounded border-charcoal-300 bg-white text-lime-400 focus:ring-lime-400/30"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-lime-400 text-charcoal-900 rounded-lg font-medium hover:bg-lime-300 transition-colors"
                >
                  {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? 'Saved!' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="bg-white rounded-2xl border-2 border-charcoal-100 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-charcoal-900">Appearance Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-charcoal-900 mb-4">Theme</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', label: 'Light', preview: 'bg-white border-2 border-charcoal-200' },
                      { id: 'dark', label: 'Dark', preview: 'bg-charcoal-900 border-2 border-charcoal-700' },
                      { id: 'system', label: 'System', preview: 'bg-gradient-to-r from-white to-charcoal-900 border-2 border-charcoal-300' },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setAppearance({...appearance, theme: theme.id as 'light' | 'dark' | 'system'})}
                        className={cn(
                          "p-4 rounded-xl transition-all",
                          theme.preview,
                          appearance.theme === theme.id ? "ring-2 ring-lime-400 ring-offset-2" : ""
                        )}
                      >
                        <span className={cn("text-sm font-medium", theme.id === 'dark' ? 'text-white' : 'text-charcoal-900')}>
                          {theme.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 bg-charcoal-50 rounded-xl cursor-pointer">
                    <div>
                      <p className="font-medium text-charcoal-900">Compact Mode</p>
                      <p className="text-sm text-charcoal-500">Use smaller spacing and fonts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={appearance.compactMode}
                      onChange={(e) => setAppearance({...appearance, compactMode: e.target.checked})}
                      className="w-5 h-5 rounded border-charcoal-300 bg-white text-lime-400 focus:ring-lime-400/30"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-charcoal-50 rounded-xl cursor-pointer">
                    <div>
                      <p className="font-medium text-charcoal-900">Show Animations</p>
                      <p className="text-sm text-charcoal-500">Enable page transitions and effects</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={appearance.showAnimations}
                      onChange={(e) => setAppearance({...appearance, showAnimations: e.target.checked})}
                      className="w-5 h-5 rounded border-charcoal-300 bg-white text-lime-400 focus:ring-lime-400/30"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-lime-400 text-charcoal-900 rounded-lg font-medium hover:bg-lime-300 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Appearance
                </button>
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="bg-white rounded-2xl border-2 border-charcoal-100 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-charcoal-900">Business Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Agency Name</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                    <input
                      type="text"
                      value={profile.agencyName}
                      onChange={(e) => setProfile({...profile, agencyName: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-charcoal-50 border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">FFC Number</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                    <input
                      type="text"
                      value={profile.ffcNumber}
                      onChange={(e) => setProfile({...profile, ffcNumber: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-charcoal-50 border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* FFC Status */}
              <div className="p-4 bg-lime-50 rounded-xl border border-lime-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-lime-400/20 rounded-lg flex items-center justify-center">
                    <Check className="w-5 h-5 text-lime-400" />
                  </div>
                  <div>
                    <p className="font-medium text-lime-400">FFC Verified</p>
                    <p className="text-sm text-charcoal-500">Valid until December 2025</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-lime-400 text-charcoal-900 rounded-lg font-medium hover:bg-lime-300 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Business Info
                </button>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bg-white rounded-2xl border-2 border-charcoal-100 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-charcoal-900">API Keys</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-lime-400 text-charcoal-900 rounded-lg font-medium text-sm hover:bg-lime-300 transition-colors">
                  <Key className="w-4 h-4" />
                  Generate New Key
                </button>
              </div>
              
              <div className="space-y-3">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="p-4 bg-charcoal-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-charcoal-900">{apiKey.name}</p>
                      <button className="text-sm text-rose-500 hover:text-rose-600">Revoke</button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm text-charcoal-500 font-mono">
                        {showApiKey ? apiKey.key : '••••••••••••••••••••••••'}
                      </code>
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-charcoal-400 hover:text-charcoal-600"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-charcoal-500">
                      <span>Created: {apiKey.created}</span>
                      <span>Last used: {apiKey.lastUsed}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-rose-700">Keep your API keys secure</p>
                    <p className="text-sm text-rose-600 mt-1">
                      Never share your API keys in public repositories or client-side code. 
                      Use environment variables for production.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}