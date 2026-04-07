'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Wrench, 
  DollarSign, 
  MessageSquare,
  Settings,
  LogOut,
  Home,
  Bell,
  Search,
  CreditCard,
  Target,
  UserCheck,
  Wallet,
  Trophy,
  Calculator,
  FileText,
  Calendar,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/properties', label: 'Properties', icon: Building2 },
  { href: '/rent-ai', label: 'Rent AI', icon: Sparkles },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/valuations', label: 'Valuations', icon: Calculator },
  { href: '/matching', label: 'Tenant Match', icon: Target },
  { href: '/escrow', label: 'Escrow', icon: Wallet },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/rankings', label: 'Rankings', icon: Trophy },
  { href: '/agents', label: 'Agents', icon: UserCheck },
  { href: '/tenants', label: 'Tenants', icon: Users },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/financials', label: 'Financials', icon: DollarSign },
  { href: '/chat', label: 'Messages', icon: MessageSquare },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-navy-500 text-white flex flex-col z-50 border-r border-navy-700">
      {/* Logo */}
      <div className="p-5 border-b border-navy-700">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gold-500 rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-navy-700" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white font-serif">PropAgent</h1>
            <p className="text-xs text-navy-300">Property Management</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer text-sm font-medium',
                isActive 
                  ? 'bg-gold-500/15 text-gold-400 border-l-[3px] border-gold-500' 
                  : 'text-navy-200 hover:bg-navy-600 hover:text-white'
              )}
            >
              <Icon className={cn("w-4.5 h-4.5", isActive ? "text-gold-400" : "text-navy-300")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-navy-700">
        <div className="flex items-center gap-3 px-2 py-2 mb-3">
          <div className="w-9 h-9 bg-gold-500 rounded-full flex items-center justify-center text-navy-700 font-semibold text-sm">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-navy-300 truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>
        
        <div className="space-y-1">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-navy-200 hover:bg-navy-600 hover:text-white transition-all cursor-pointer w-full text-sm font-medium">
            <Settings className="w-4.5 h-4.5" />
            <span>Settings</span>
          </button>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer w-full text-sm font-medium"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}