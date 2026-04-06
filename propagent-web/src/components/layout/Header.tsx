'use client';

import { useState } from 'react';
import { Search, Plus, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties, tenants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-text"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link 
          href="/properties/new"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white font-medium text-sm rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </Link>
      </div>
    </header>
  );
}