'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Sidebar, MobileSidebar } from '@/components/layout/Sidebar';
import { VoiceAssistant } from '@/components/ai/VoiceAssistant';
import { Bell, Settings, User, Menu } from 'lucide-react';
import Link from 'next/link';
import { useOnboardingState } from '@/lib/onboarding';

const topNavItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/properties', label: 'Properties' },
  { href: '/tenants', label: 'Tenants' },
  { href: '/financials', label: 'Financials' },
  { href: '/maintenance', label: 'Maintenance' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, isDemoMode } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { hydrated: onboardingHydrated, onboarded: onboardedLocal } = useOnboardingState();

  useEffect(() => {
    if (!loading && !user && !isDemoMode) {
      router.push('/login');
    }
  }, [user, loading, router, isDemoMode]);

  // Route first-time users through the onboarding flow once auth resolves.
  // Source of truth is `profile.onboarded_at` (server-authoritative, so the
  // flag follows the user across devices). We fall back to the
  // `agentloop-onboarded` localStorage flag for two cases:
  //   1. Supabase isn't configured in this environment (no profile ever
  //      loads) — we still want the flow to work for local / preview
  //      builds.
  //   2. Hydration race — localStorage resolves before the profile fetch,
  //      so we skip the redirect if the user *just* finished onboarding.
  // Demo mode bypasses onboarding entirely so the sample experience stays
  // frictionless.
  useEffect(() => {
    if (loading || !onboardingHydrated) return;
    if (!user || isDemoMode) return;
    if (pathname === '/onboarding') return;

    // Profile hasn't loaded yet — wait instead of redirecting on a stale
    // localStorage-only signal.
    if (user && profile === null) return;

    const onboardedServer = Boolean(profile?.onboarded_at);
    if (onboardedServer || onboardedLocal) return;

    router.push('/onboarding');
  }, [loading, onboardingHydrated, user, profile, isDemoMode, onboardedLocal, pathname, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  if (loading || (!user && !isDemoMode)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D8F053]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#FFFFFF] text-black">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[220px] xl:w-[260px] bg-white border-r border-gray-200 flex-col z-50">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-[220px] xl:ml-[260px]">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          {/* Mobile: Menu Button + Brand */}
          <div className="flex lg:hidden items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-black hover:bg-gray-100 rounded-lg"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#D8F053] rounded-full flex items-center justify-center">
                <span className="text-black font-semibold text-sm">S</span>
              </div>
              <span className="font-medium text-black">Agent Loop</span>
            </div>
          </div>

          {/* Desktop: Brand Area */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="w-9 h-9 bg-[#D8F053] rounded-full flex items-center justify-center">
              <span className="text-black font-semibold text-sm">S</span>
            </div>
            <span className="font-medium text-black">Agent Loop</span>
          </div>

          {/* Main Menu - Desktop Only */}
          <nav className="hidden lg:flex items-center gap-1">
            {topNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-black text-white' 
                      : 'text-black hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Utility Icons */}
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-black hover:bg-gray-100 rounded-full transition-all" aria-label="View notifications">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2.5 text-black hover:bg-gray-100 rounded-full transition-all" aria-label="Open settings">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center" role="img" aria-label="User profile">
              <User className="w-4 h-4 text-black" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 p-4 md:p-6 overflow-auto bg-white">
          {children}
        </main>
      </div>

      {/* AI Voice Assistant */}
      <VoiceAssistant />
    </div>
  );
}
