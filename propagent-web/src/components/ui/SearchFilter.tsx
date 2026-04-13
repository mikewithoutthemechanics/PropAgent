import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchFilterProps<T> {
  data: T[];
  searchKeys: (keyof T)[];
  placeholder?: string;
  onFilter: (filtered: T[]) => void;
  className?: string;
}

export function SearchFilter<T extends Record<string, unknown>>({ 
  data, 
  searchKeys, 
  placeholder = 'Search...', 
  onFilter,
  className 
}: SearchFilterProps<T>) {
  const [query, setQuery] = useState('');

  const handleSearch = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      onFilter(data);
      return;
    }
    const lower = value.toLowerCase();
    const filtered = data.filter(item => 
      searchKeys.some(key => {
        const val = item[key];
        return val !== undefined && String(val).toLowerCase().includes(lower);
      })
    );
    onFilter(filtered);
  };

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400/50"
      />
      {query && (
        <button
          onClick={() => handleSearch('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface FilterDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterDropdown({ label, options, value, onChange, className }: FilterDropdownProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Filter className="w-4 h-4 text-gray-500" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/30"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}