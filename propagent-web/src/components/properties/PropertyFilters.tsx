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

  // Sync local filters with prop filters
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

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy') return false;
    if (value === undefined || value === '' || value === null) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }).length;

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
      {/* Main Search Bar */}
      <div className="p-4 border-b border-stone-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by suburb, city, or province..."
              value={localFilters.location || ''}
              onChange={(e) => updateFilter('location', e.target.value || undefined)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
            {localFilters.location && (
              <button
                onClick={() => updateFilter('location', undefined)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-stone-400 hover:text-stone-600" />
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
                className="appearance-none pl-3 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer min-w-[120px]"
              >
                <option value="">All Listings</option>
                {listingTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>

            {/* Property Type */}
            <div className="relative">
              <select
                value={localFilters.propertyTypes?.[0] || ''}
                onChange={(e) => {
                  const value = e.target.value as PropertyType;
                  updateFilter('propertyTypes', value ? [value] : undefined);
                }}
                className="appearance-none pl-3 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer min-w-[140px]"
              >
                <option value="">All Types</option>
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <Home className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>

            {/* Bedrooms */}
            <div className="relative">
              <select
                value={localFilters.bedrooms || ''}
                onChange={(e) => updateFilter('bedrooms', e.target.value ? Number(e.target.value) : undefined)}
                className="appearance-none pl-3 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer min-w-[100px]"
              >
                <option value="">Beds</option>
                {bedroomOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <BedDouble className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={localFilters.sortBy || 'featured'}
                onChange={(e) => updateFilter('sortBy', (e.target.value as PropertyFiltersType['sortBy']) || 'featured')}
                className="appearance-none pl-3 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer min-w-[140px]"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>

            {/* More Filters Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "relative",
                activeFiltersCount > 0 && "border-amber-300 text-amber-700"
              )}
            >
              <SlidersHorizontal className="w-4 h-4 mr-1.5" />
              More Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 border-b border-stone-100 bg-stone-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Price Range */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-3">
                <DollarSign className="w-4 h-4 text-amber-500" />
                Price Range
              </label>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => handlePriceRangeChange(range.min, range.max)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      (filters.minPrice === range.min && filters.maxPrice === (range.max === Infinity ? undefined : range.max))
                        ? "bg-amber-100 text-amber-700 font-medium"
                        : "hover:bg-stone-100 text-stone-600"
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-3">
                <Bath className="w-4 h-4 text-amber-500" />
                Bathrooms
              </label>
              <div className="flex flex-wrap gap-2">
                {bathroomOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateFilter('bathrooms', opt.value === filters.bathrooms ? undefined : opt.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm transition-colors",
                      filters.bathrooms === opt.value
                        ? "bg-amber-500 text-white"
                        : "bg-white border border-stone-200 text-stone-600 hover:border-amber-300"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Types (Multi-select) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-3">
                <Home className="w-4 h-4 text-amber-500" />
                Property Types
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {propertyTypes.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-2 cursor-pointer hover:bg-stone-100 p-2 rounded-lg transition-colors"
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
                      className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm text-stone-600">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Province */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-3">
                <MapPin className="w-4 h-4 text-amber-500" />
                Province
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {saProvinces.map((province) => (
                  <label
                    key={province.value}
                    className="flex items-center gap-2 cursor-pointer hover:bg-stone-100 p-2 rounded-lg transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm text-stone-600">{province.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Bar */}
      <div className="px-4 py-3 bg-stone-50 rounded-b-xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <span className="font-medium text-stone-700">{totalResults ?? 0}</span>
          properties found
          {activeFiltersCount > 0 && (
            <span className="text-amber-600">({activeFiltersCount} filters applied)</span>
          )}
        </div>
        
        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
}
