'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isDemoMode } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Allow access in demo mode
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
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[260px]">
        <Header />
        <main className="flex-1 p-6 overflow-auto bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
