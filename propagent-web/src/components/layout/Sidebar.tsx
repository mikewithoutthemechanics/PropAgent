import { useState } from 'react';
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
  CreditCard,
  Target,
  UserCheck,
  Wallet,
  Trophy,
  Calculator,
  FileText,
  Calendar,
  Sparkles,
  Menu,
  X
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

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 md:p-5 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 md:w-10 h-9 md:h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
            <Home className="w-4 md:w-5 h-4 md:h-5 text-slate-900" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-semibold tracking-tight text-white">PropAgent</h1>
            <p className="text-xs text-slate-500 hidden md:block">Property Management</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-sm font-medium',
                isActive 
                  ? 'bg-gradient-to-r from-gold-500/20 to-transparent text-gold-400 border-l-[3px] border-gold-500' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              )}
            >
              <Icon className={cn("w-4.5 h-4.5", isActive ? "text-gold-400" : "text-slate-500")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 md:p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="w-8 md:w-9 h-8 md:h-9 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-slate-900 font-semibold text-xs md:text-sm shadow-lg shadow-gold-500/20">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0 hidden md:block">
            <p className="text-sm font-medium text-white truncate">
              {user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>
        
        <div className="space-y-1">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-all cursor-pointer w-full text-sm font-medium">
            <Settings className="w-4.5 h-4.5" />
            <span className="hidden md:inline">Settings</span>
          </button>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer w-full text-sm font-medium"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Mobile sidebar wrapper with overlay
export function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-[280px] bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col z-50 border-r border-slate-800 transition-transform duration-300 lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar onClose={onClose} />
      </aside>
    </>
  );
}
