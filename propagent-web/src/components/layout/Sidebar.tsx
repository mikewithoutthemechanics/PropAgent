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
  Share2,
  ArrowUpRight,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/properties', label: 'Properties', icon: Building2 },
  { href: '/syndication', label: 'Syndication', icon: Share2 },
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
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#D8F053] rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-black">PropAgent</h1>
            <p className="text-xs text-gray-500">Property Management</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-200 cursor-pointer text-sm font-medium',
                isActive 
                  ? 'bg-black text-white' 
                  : 'text-black hover:bg-gray-100'
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-black")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-2 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-50 rounded-full">
          <div className="w-8 h-8 bg-[#D8F053] rounded-full flex items-center justify-center text-black font-semibold text-sm">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-black truncate">
              {user?.email?.split('@')[0] || 'User'}
            </p>
          </div>
        </div>
        
        <div className="space-y-1">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-full text-black hover:bg-gray-100 transition-all cursor-pointer w-full text-sm font-medium">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-full text-red-600 hover:bg-red-50 transition-all cursor-pointer w-full text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
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
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          style={{ backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-[260px] bg-white text-black flex flex-col z-50 border-r border-gray-200 transition-transform duration-300 lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar onClose={onClose} />
      </aside>
    </>
  );
}
