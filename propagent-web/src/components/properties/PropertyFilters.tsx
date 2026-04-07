'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  Search, SlidersHorizontal, X, ChevronDown, MapPin, 
  Home, DollarSign, BedDouble, Bath
} from 'lucide-react';
import { PropertyFilters as PropertyFiltersType, PropertyType, ListingType } from '@/types/property';
import { Button } from '@/components/ui';
import { cn, formatCurrency } from '@/lib/utils';
import { saProvinces, propertyTypes, listingTypes } from '@/lib/sample-data';

interface PropertyFiltersProps {
  filters: PropertyFiltersType;
  onFiltersChange: (filters: PropertyFiltersType) => void;
  onReset: () => void;
  totalResults?: number;
}

const bedroomOptions = [
  { value: 0, label: 'Studio' },
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 5, label: '5+' },
];

const bathroomOptions = [
  { value: 1, label: '1+' },
  { value: 1.5, label: '1.5+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
];

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'views', label: 'Most Viewed' },
];

const priceRanges = [
  { min: 0, max: 500000, label: 'Under R500K' },
  { min: 500000, max: 1000000, label: 'R500K - R1M' },
  { min: 1000000, max: 2500000, label: 'R1M - R2.5M' },
  { min: 2500000, max: 5000000, label: 'R2.5M - R5M' },
  { min: 5000000, max: 10000000, label: 'R5M - R10M' },
  { min: 10000000, max: Infinity, label: 'R10M+' },
];

export function PropertyFilters({ 
  filters, 
  onFiltersChange, 
  onReset,
  totalResults 
}: PropertyFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<PropertyFiltersType>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = useCallback(<K extends keyof PropertyFiltersType>(
    key: K,
    value: PropertyFiltersType[K]
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  }, [localFilters, onFiltersChange]);

  const handlePriceRangeChange = (min: number, max: number) => {
    updateFilter('minPrice', min);
    updateFilter('maxPrice', max === Infinity ? undefined : max);
  };

  const handleProvinceChange = (province: string) => {
    const currentProvinces = filters.provinces || [];
    const newProvinces = currentProvinces.includes(province)
      ? currentProvinces.filter(p => p !== province)
      : [...currentProvinces, province];
    updateFilter('provinces', newProvinces.length > 0 ? newProvinces : undefined);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy') return false;
    if (value === undefined || value === '' || value === null) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }).length;

  return (
    <div className="bg-gray-900/60 border border-white/10 rounded-xl backdrop-blur-xl">
      {/* Main Search Bar */}
      <div className="p-4 border-b border-white/10">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by suburb, city, or province..."
              value={localFilters.location || ''}
              onChange={(e) => updateFilter('location', e.target.value || undefined)}
              aria-label="Search properties by location"
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all"
            />
            {localFilters.location && (
              <button
                onClick={() => updateFilter('location', undefined)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Listing Type */}
            <div className="relative">
              <select
                value={localFilters.listingType || ''}
                onChange={(e) => updateFilter('listingType', (e.target.value as ListingType) || undefined)}
                aria-label="Filter by listing type"
                className="appearance-none pl-3 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 cursor-pointer min-w-[120px]"
              >
                <option value="" className="bg-gray-900">All Listings</option>
                {listingTypes.map(type => (
                  <option key={type.value} value={type.value} className="bg-gray-900">{type.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Property Type */}
            <div className="relative">
              <select
                value={localFilters.propertyTypes?.[0] || ''}
                onChange={(e) => {
                  const value = e.target.value as PropertyType;
                  updateFilter('propertyTypes', value ? [value] : undefined);
                }}
                aria-label="Filter by property type"
                className="appearance-none pl-3 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 cursor-pointer min-w-[140px]"
              >
                <option value="" className="bg-gray-900">All Types</option>
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value} className="bg-gray-900">{type.label}</option>
                ))}
              </select>
              <Home className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Bedrooms */}
            <div className="relative">
              <select
                value={localFilters.bedrooms || ''}
                onChange={(e) => updateFilter('bedrooms', e.target.value ? Number(e.target.value) : undefined)}
                aria-label="Filter by bedrooms"
                className="appearance-none pl-3 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 cursor-pointer min-w-[100px]"
              >
                <option value="" className="bg-gray-900">Beds</option>
                {bedroomOptions.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
                ))}
              </select>
              <BedDouble className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={localFilters.sortBy || 'featured'}
                onChange={(e) => updateFilter('sortBy', (e.target.value as PropertyFiltersType['sortBy']) || 'featured')}
                aria-label="Sort properties"
                className="appearance-none pl-3 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 cursor-pointer min-w-[140px]"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* More Filters Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-controls="expanded-filters"
              className={cn(
                "cursor-pointer",
                activeFiltersCount > 0 && "border-gold-500 text-gold-400"
              )}
            >
              <SlidersHorizontal className="w-4 h-4 mr-1.5" />
              More Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gold-500 text-white rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div id="expanded-filters" className="p-4 border-b border-white/10 bg-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Price Range */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-3">
                <DollarSign className="w-4 h-4 text-gold-400" />
                Price Range
              </label>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => handlePriceRangeChange(range.min, range.max)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                      (filters.minPrice === range.min && filters.maxPrice === (range.max === Infinity ? undefined : range.max))
                        ? "bg-gold-500/20 text-gold-400 font-medium border border-gold-500/30"
                        : "hover:bg-white/10 text-slate-300"
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-3">
                <Bath className="w-4 h-4 text-gold-400" />
                Bathrooms
              </label>
              <div className="flex flex-wrap gap-2">
                {bathroomOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateFilter('bathrooms', opt.value === filters.bathrooms ? undefined : opt.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                      filters.bathrooms === opt.value
                        ? "bg-gold-500 text-white"
                        : "bg-white/5 border border-white/10 text-slate-300 hover:border-gold-500/30"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Types (Multi-select) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-3">
                <Home className="w-4 h-4 text-gold-400" />
                Property Types
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {propertyTypes.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.propertyTypes?.includes(type.value as PropertyType) || false}
                      onChange={(e) => {
                        const current = filters.propertyTypes || [];
                        if (e.target.checked) {
                          updateFilter('propertyTypes', [...current, type.value as PropertyType]);
                        } else {
                          updateFilter('propertyTypes', current.filter(t => t !== type.value));
                        }
                      }}
                      className="w-4 h-4 rounded border-white/20 text-gold-500 focus:ring-amber-500 bg-white/5 cursor-pointer"
                    />
                    <span className="text-sm text-slate-300">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Province */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-3">
                <MapPin className="w-4 h-4 text-gold-400" />
                Province
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {saProvinces.map((province) => (
                  <label
                    key={province.value}
                    className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.provinces?.includes(province.value) || false}
                      onChange={() => handleProvinceChange(province.value)}
                      className="w-4 h-4 rounded border-white/20 text-gold-500 focus:ring-gold-500 bg-white/5 cursor-pointer"
                    />
                    <span className="text-sm text-slate-300">{province.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Bar */}
      <div className="px-4 py-3 bg-white/5 rounded-b-xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="font-medium text-white">{totalResults ?? 0}</span>
          properties found
          {activeFiltersCount > 0 && (
            <span className="text-gold-400">({activeFiltersCount} filters applied)</span>
          )}
        </div>
        
        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
}
