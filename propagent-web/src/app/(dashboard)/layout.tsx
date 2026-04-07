'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Sidebar, MobileSidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isDemoMode } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && !isDemoMode) {
      router.push('/login');
    }
  }, [user, loading, router, isDemoMode]);

  if (loading || (!user && !isDemoMode)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[220px] xl:w-[260px] bg-gradient-to-b from-slate-900 to-slate-950 flex-col z-50 border-r border-slate-800">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-[220px] xl:ml-[260px]">
        {/* Mobile Header */}
        <header className="lg:hidden h-14 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-slate-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-semibold text-sm">P</span>
            </div>
            <span className="font-semibold">PropAgent</span>
          </div>
          <div className="w-10" /> {/* Spacer for balance */}
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 items-center justify-between sticky top-0 z-30">
          <div className="text-sm text-slate-400">
            Welcome back
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">{user?.email}</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-auto bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
