'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Grid3X3, List, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { sampleProperties, samplePropertyStats } from '@/lib/sample-data';
import { PropertyFilters } from '@/components/properties/PropertyFilters';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyFilters as PropertyFiltersType } from '@/types/property';
import { Button, Card } from '@/components/ui';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 9;

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < 30; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.2 + 0.05
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(217, 160, 102, ${p.alpha})`;
        ctx.fill();
      });
      
      animationFrame = requestAnimationFrame(animate);
    };

    resize();
    createParticles();
    animate();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  );
};

const GradientHeader = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(217,160,102,0.15)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.1)_0%,_transparent_50%)]" />
      <AnimatedBackground />
      
      <div className={cn(
        "relative px-6 py-8 transition-all duration-700",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-indigo-400 text-sm font-medium">Property Portfolio</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Properties</h1>
        <p className="text-gray-400">
          {samplePropertyStats.totalListings} total listings • {samplePropertyStats.activeListings} active
        </p>
      </div>

      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />
    </div>
  );
};

const GlassFilters = ({ children, totalResults }: { children: React.ReactNode; totalResults: number }) => (
  <div className="relative backdrop-blur-xl bg-gray-900/60 border border-white/10 rounded-2xl p-5">
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-gray-300 text-sm font-medium">Filters</span>
        </div>
        <span className="text-indigo-400 text-sm font-semibold">{totalResults} results</span>
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
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
      style={{ 
        transitionDelay: `${index * 100}ms`,
        transform: isHovered ? 'translateY(-8px) rotateX(2deg)' : 'translateY(0) rotateX(0)',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        "relative transition-all duration-300",
        isHovered && "transform scale-[1.02]"
      )}>
        <div className={cn(
          "absolute -inset-2 bg-gradient-to-r from-indigo-500/20 to-indigo-700/20 rounded-2xl blur-xl opacity-0 transition-opacity duration-300",
          isHovered && "opacity-100"
        )} />
        <PropertyCard
          property={property}
          variant={variant}
          onEdit={onEdit}
          onSyndicate={onSyndicate}
          onFavorite={onFavorite}
          isFavorite={isFavorite}
        />
      </div>
    </div>
  );
};

const SkeletonCard = ({ variant = 'default' }: { variant?: 'default' | 'compact' }) => (
  <div className={cn(
    "animate-pulse bg-gray-800/50 rounded-xl border border-white/5",
    variant === 'default' ? "h-[420px]" : "h-28"
  )}>
    {variant === 'default' && (
      <div className="h-56 bg-gray-700/30 rounded-t-xl" />
    )}
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-700/30 rounded w-3/4" />
      <div className="h-3 bg-gray-700/30 rounded w-1/2" />
      <div className="h-3 bg-gray-700/30 rounded w-full" />
      <div className="flex gap-4 pt-2">
        <div className="h-3 bg-gray-700/30 rounded w-12" />
        <div className="h-3 bg-gray-700/30 rounded w-12" />
        <div className="h-3 bg-gray-700/30 rounded w-12" />
      </div>
    </div>
  </div>
);

const AnimatedPagination = ({ 
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
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    setIsAnimating(true);
    onPageChange(page);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <div className={cn(
      "flex items-center justify-between transition-all duration-300",
      isAnimating ? "opacity-0 translate-y-2" : "opacity-100"
    )}>
      <p className="text-sm text-gray-400">
        Showing <span className="text-indigo-400 font-medium">{startItem}</span> - <span className="text-indigo-400 font-medium">{endItem}</span> of <span className="text-indigo-400 font-medium">{totalItems}</span> properties
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="group p-2 rounded-xl border border-white/10 hover:border-indigo-500/50 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
        >
          <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-indigo-400 transition-colors" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={cn(
              "w-10 h-10 rounded-xl text-sm font-medium transition-all duration-300",
              currentPage === page
                ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105"
                : "border border-white/10 hover:border-indigo-500/30 text-gray-400 hover:text-indigo-400"
            )}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="group p-2 rounded-xl border border-white/10 hover:border-indigo-500/50 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
        >
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-400 transition-colors" />
        </button>
      </div>
    </div>
  );
};

const FloatingActionButton = ({ onClick }: { onClick: () => void }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-8 right-8 z-40 group"
      style={{
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.3s ease',
      }}
    >
      <div className="absolute -inset-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full blur-lg opacity-60 group-hover:opacity-80 transition-opacity" />
      <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full shadow-xl shadow-indigo-500/30 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-indigo-500/40">
        <Plus className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-90" />
      </div>
    </button>
  );
};

export default function PropertiesPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<PropertyFiltersType>({
    sortBy: 'featured',
  });
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setParallaxOffset(window.scrollY * 0.1);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProperties = useMemo(() => {
    let result = [...sampleProperties];

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
  }, [filters]);

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

  const handleFavoriteToggle = useCallback((id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  }, []);

  const handleAddProperty = () => {
    setIsPageTransitioning(true);
    setTimeout(() => {
      router.push('/properties/new');
    }, 300);
  };

  const handleEditProperty = (id: string) => {
    router.push(`/properties/${id}/edit`);
  };

  const handleSyndicateProperty = (id: string) => {
    console.log('Syndicate property:', id);
  };

  return (
    <div 
      className={cn(
        "min-h-screen bg-gray-950 relative overflow-hidden transition-all duration-500",
        isPageTransitioning && "opacity-0 scale-[0.98]"
      )}
      style={{
        transform: `translateY(${parallaxOffset}px)`,
      }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(217,160,102,0.08)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.05)_0%,_transparent_50%)]" />
        <AnimatedBackground />
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-40 -right-16 w-32 h-32 border border-indigo-500/10 rotate-45 rounded-2xl animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div 
          className="absolute bottom-40 -left-16 w-24 h-24 border border-violet-500/10 rounded-full animate-pulse"
          style={{ animationDuration: '10s', animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        {/* Premium Header */}
        <div className={cn(
          "transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <GradientHeader />
        </div>

        {/* Controls */}
        <div className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 transition-all duration-700 delay-100",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-900/60 border border-white/10 rounded-xl p-1 backdrop-blur-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2.5 rounded-lg transition-all duration-300",
                  viewMode === 'grid' 
                    ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
                title="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2.5 rounded-lg transition-all duration-300",
                  viewMode === 'list' 
                    ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
          <Button 
            onClick={handleAddProperty}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Property
          </Button>
        </div>

        {/* Glass Filters */}
        <div className={cn(
          "mt-6 transition-all duration-700 delay-200",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
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
        <div className={cn(
          "mt-6 transition-all duration-700 delay-300",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <Card className="p-6 bg-gray-900/60 border border-white/10 backdrop-blur-xl">
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center border border-white/10">
                  <Plus className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-white">No properties found</h3>
                <p className="text-gray-500 mt-1 mb-4">Try adjusting your filters or add a new property.</p>
                <Button variant="outline" onClick={handleResetFilters} className="border-white/20 hover:border-indigo-500/50">
                  Clear Filters
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Animated Pagination */}
        {totalPages > 1 && !isLoading && (
          <div className={cn(
            "mt-6 transition-all duration-700 delay-400",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <AnimatedPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredProperties.length}
            />
          </div>
        )}

        {/* Floating Action Button */}
        <FloatingActionButton onClick={handleAddProperty} />
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
}
