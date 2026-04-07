'use client';

import { useState } from 'react';
import { Search, Plus, Bell, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search properties, tenants, documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/10 transition-all cursor-text"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-500 hover:text-navy-500 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        
        <Link 
          href="/properties/new"
          className="flex items-center gap-2 px-4 py-2 bg-navy-500 text-white font-medium text-sm rounded-lg hover:bg-navy-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </Link>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-navy-700" />
          </div>
        </div>
      </div>
    </header>
  );
}