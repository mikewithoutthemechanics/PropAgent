'use client';

import { useState } from 'react';
import { Search, Plus, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  return (
    <header className="h-14 bg-slate-900 border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search properties, tenants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-colors cursor-text"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link 
          href="/properties/new"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white font-medium text-sm rounded-md hover:bg-amber-600 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </Link>
      </div>
    </header>
  );
}