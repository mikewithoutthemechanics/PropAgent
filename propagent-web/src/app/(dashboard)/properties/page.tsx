'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Grid3X3, List, ChevronLeft, ChevronRight, Sparkles, Search, SlidersHorizontal, X } from 'lucide-react';
import { sampleProperties, samplePropertyStats } from '@/lib/sample-data';
import { PropertyFilters } from '@/components/properties/PropertyFilters';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Property, PropertyFilters as PropertyFiltersType } from '@/types/property';
import { Button, Card } from '@/components/ui';
import { cn, formatCurrency } from '@/lib/utils';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useLocalStorageState, useCollection } from '@/lib/persistence';

const ITEMS_PER_PAGE = 9;

const GradientHeader = () => (
  <div className="relative overflow-hidden rounded-2xl bg-white border border-[var(--charcoal-100)]">
    <div className="absolute inset-0 bg-gradient-to-br from-[var(--lime-50)] via-white to-[var(--sky-50)]" />
    
    <div className="relative px-6 py-8">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-[var(--lime-500)]" />
        <span className="text-[var(--lime-600)] text-sm font-medium">Property Portfolio</span>
      </div>
      <h1 className="text-3xl font-bold text-[var(--charcoal-900)] mb-2">Properties</h1>
      <p className="text-[var(--charcoal-500)]">
        {samplePropertyStats.totalListings} total listings • {samplePropertyStats.activeListings} active
      </p>
    </div>

    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[var(--lime-400)]/10 rounded-full blur-3xl" />
    <div className="absolute -top-24 -left-24 w-48 h-48 bg-[var(--sky-400)]/10 rounded-full blur-3xl" />
  </div>
);

const GlassFilters = ({ children, totalResults }: { children: React.ReactNode; totalResults: number }) => (
  <div className="relative bg-white border border-[var(--charcoal-100)] rounded-2xl p-5">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--lime-400)]/30 to-transparent" />
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--lime-500)] animate-pulse" />
          <span className="text-[var(--charcoal-500)] text-sm font-medium">Filters</span>
        </div>
        <span className="text-[var(--lime-600)] text-sm font-semibold">{totalResults} results</span>
      </div>
      {children}
    </div>
  </div>
);

const PropertyCardWrapper = ({ 
  property, 
  index, 
  variant,
  onEdit,
  onSyndicate,
  onFavorite,
  isFavorite
}: {
  property: any;
  index: number;
  variant: 'default' | 'compact';
  onEdit?: (id: string) => void;
  onSyndicate?: (id: string) => void;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}) => {
  return (
    <PropertyCard
      property={property}
      variant={variant}
      onEdit={onEdit}
      onSyndicate={onSyndicate}
      onFavorite={onFavorite}
      isFavorite={isFavorite}
    />
  );
};

const SkeletonCard = ({ variant = 'default' }: { variant?: 'default' | 'compact' }) => (
  <div className={cn(
    "animate-pulse bg-[var(--charcoal-50)] rounded-xl border border-[var(--charcoal-100)]",
    variant === 'default' ? "h-[420px]" : "h-28"
  )}>
    {variant === 'default' && (
      <div className="h-56 bg-[var(--charcoal-100)]/50 rounded-t-xl" />
    )}
    <div className="p-4 space-y-3">
      <div className="h-4 bg-[var(--charcoal-100)]/50 rounded w-3/4" />
      <div className="h-3 bg-[var(--charcoal-100)]/50 rounded w-1/2" />
      <div className="h-3 bg-[var(--charcoal-100)]/50 rounded w-full" />
      <div className="flex gap-4 pt-2">
        <div className="h-3 bg-[var(--charcoal-100)]/50 rounded w-12" />
        <div className="h-3 bg-[var(--charcoal-100)]/50 rounded w-12" />
        <div className="h-3 bg-[var(--charcoal-100)]/50 rounded w-12" />
      </div>
    </div>
  </div>
);

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems
}: { 
  currentPage: number; 
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
}) => {
  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-[var(--charcoal-500)]">
        Showing <span className="text-[var(--lime-600)] font-medium">{startItem}</span> - <span className="text-[var(--lime-600)] font-medium">{endItem}</span> of <span className="text-[var(--lime-600)] font-medium">{totalItems}</span> properties
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="group p-2 rounded-xl border border-[var(--charcoal-200)] hover:border-[var(--lime-400)] hover:bg-[var(--lime-50)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-[var(--charcoal-500)] group-hover:text-[var(--charcoal-900)] transition-colors" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "w-10 h-10 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer",
              currentPage === page
                ? "bg-[var(--lime-400)] text-[var(--charcoal-900)] shadow-lg shadow-[var(--lime-400)]/25"
                : "border border-[var(--charcoal-200)] hover:border-[var(--lime-400)] text-[var(--charcoal-500)] hover:text-[var(--charcoal-900)]"
            )}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="group p-2 rounded-xl border border-[var(--charcoal-200)] hover:border-[var(--lime-400)] hover:bg-[var(--lime-50)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 text-[var(--charcoal-500)] group-hover:text-[var(--charcoal-900)] transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default function PropertiesPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<PropertyFiltersType>({
    sortBy: 'featured',
  });
  const [favoriteIds, setFavoriteIds] = useLocalStorageState<string[]>(
    'property_favorites',
    [],
  );
  const favorites = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const { items: userProperties } = useCollection<Property>(
    'user_properties',
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const allProperties = useMemo(
    () => [...userProperties, ...sampleProperties],
    [userProperties],
  );

  const filteredProperties = useMemo(() => {
    let result = [...allProperties];

    if (filters.location) {
      const searchTerm = filters.location.toLowerCase();
      result = result.filter(p => 
        p.location.suburb.toLowerCase().includes(searchTerm) ||
        p.location.city.toLowerCase().includes(searchTerm) ||
        p.location.province.toLowerCase().includes(searchTerm) ||
        p.title.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.listingType) {
      result = result.filter(p => p.listingType === filters.listingType);
    }

    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      result = result.filter(p => filters.propertyTypes?.includes(p.type));
    }

    if (filters.bedrooms) {
      result = result.filter(p => p.specs.bedrooms >= filters.bedrooms!);
    }

    if (filters.bathrooms) {
      result = result.filter(p => p.specs.bathrooms >= filters.bathrooms!);
    }

    if (filters.minPrice !== undefined) {
      result = result.filter(p => p.pricing.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      result = result.filter(p => p.pricing.price <= filters.maxPrice!);
    }

    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.pricing.price - b.pricing.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.pricing.price - a.pricing.price);
        break;
      case 'date_desc':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'date_asc':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'views':
        result.sort((a, b) => b.viewCount - a.viewCount);
        break;
      default:
        break;
    }

    return result;
  }, [allProperties, filters]);

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage]);

  const handleFiltersChange = useCallback((newFilters: PropertyFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ sortBy: 'featured' });
    setCurrentPage(1);
  }, []);

  const handleFavoriteToggle = useCallback(
    (id: string) => {
      setFavoriteIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    },
    [setFavoriteIds],
  );

  const handleAddProperty = () => {
    router.push('/properties/new');
  };

  const handleEditProperty = (id: string) => {
    router.push(`/properties/${id}/edit`);
  };

  const handleSyndicateProperty = (id: string) => {
    console.log('Syndicate property:', id);
  };

  return (
    <div className="min-h-screen bg-white relative">
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        {/* Premium Header */}
        <div className="mb-6">
          <GradientHeader />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[var(--charcoal-50)] border border-[var(--charcoal-200)] rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2.5 rounded-lg transition-all duration-300 cursor-pointer",
                  viewMode === 'grid' 
                    ? "bg-[var(--lime-400)] text-[var(--charcoal-900)] shadow-lg shadow-[var(--lime-400)]/25" 
                    : "text-[var(--charcoal-500)] hover:text-[var(--charcoal-900)] hover:bg-[var(--charcoal-100)]"
                )}
                aria-label="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2.5 rounded-lg transition-all duration-300 cursor-pointer",
                  viewMode === 'list' 
                    ? "bg-[var(--lime-400)] text-[var(--charcoal-900)] shadow-lg shadow-[var(--lime-400)]/25" 
                    : "text-[var(--charcoal-500)] hover:text-[var(--charcoal-900)] hover:bg-[var(--charcoal-100)]"
                )}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
          <Button 
            onClick={handleAddProperty}
            className="bg-[var(--lime-400)] hover:bg-[var(--lime-500)] shadow-lg shadow-[var(--lime-400)]/25 text-[var(--charcoal-900)] transition-all duration-300 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Property
          </Button>
        </div>

        {/* Glass Filters */}
        <div className="mb-6">
          <GlassFilters totalResults={filteredProperties.length}>
            <PropertyFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
              totalResults={filteredProperties.length}
            />
          </GlassFilters>
        </div>

        {/* Properties Grid/List */}
        <div className="mb-6">
          <Card className="p-6 bg-white border border-[var(--charcoal-100)]">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedProperties.map((property, index) => (
                  <PropertyCardWrapper
                    key={property.id}
                    property={property}
                    index={index}
                    variant="default"
                    onEdit={handleEditProperty}
                    onSyndicate={handleSyndicateProperty}
                    onFavorite={handleFavoriteToggle}
                    isFavorite={favorites.has(property.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedProperties.map((property, index) => (
                  <PropertyCardWrapper
                    key={property.id}
                    property={property}
                    index={index}
                    variant="compact"
                    onEdit={handleEditProperty}
                    onSyndicate={handleSyndicateProperty}
                    onFavorite={handleFavoriteToggle}
                    isFavorite={favorites.has(property.id)}
                  />
                ))}
              </div>
            )}

            {filteredProperties.length === 0 && !isLoading && (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--charcoal-50)] flex items-center justify-center border border-[var(--charcoal-100)]">
                  <Plus className="w-8 h-8 text-[var(--charcoal-400)]" />
                </div>
                <h3 className="text-lg font-medium text-[var(--charcoal-900)]">No properties found</h3>
                <p className="text-[var(--charcoal-500)] mt-1 mb-4">Try adjusting your filters or add a new property.</p>
                <Button variant="outline" onClick={handleResetFilters} className="border-[var(--charcoal-200)] hover:border-[var(--lime-400)] text-[var(--charcoal-700)] hover:text-[var(--charcoal-900)] cursor-pointer">
                  Clear Filters
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <div className="mb-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredProperties.length}
            />
          </div>
        )}
      </div>
    </div>
  );
}