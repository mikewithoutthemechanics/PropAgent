'use client';

import { useState } from 'react';
import { Search, Plus, Bell, User, Command } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-gold-400 transition-colors" />
          <input
            type="text"
            placeholder="Search properties, tenants, documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-20 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/10 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-slate-500">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="p-2.5 text-slate-400 hover:text-gold-400 hover:bg-slate-800/50 rounded-xl transition-all">
          <Bell className="w-5 h-5" />
        </button>
        
        <Link 
          href="/properties/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 font-semibold text-sm rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all shadow-lg shadow-gold-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </Link>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
          <div className="w-9 h-9 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-lg shadow-gold-500/20">
            <User className="w-4 h-4 text-slate-900" />
          </div>
        </div>
      </div>
    </header>
  );
}
