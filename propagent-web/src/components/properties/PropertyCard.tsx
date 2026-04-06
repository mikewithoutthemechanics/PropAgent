'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Bed, Bath, Car, MapPin, Heart, Share2, Edit3, Eye, 
  ExternalLink, MoreHorizontal, ChevronLeft, ChevronRight,
  Maximize2
} from 'lucide-react';
import { Property } from '@/types/property';
import { formatCurrency, getStatusBadgeStyles, cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'compact' | 'featured';
  onEdit?: (id: string) => void;
  onSyndicate?: (id: string) => void;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export function PropertyCard({ 
  property, 
  variant = 'default',
  onEdit,
  onSyndicate,
  onFavorite,
  isFavorite = false
}: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const images = property.images.length > 0 ? property.images : [];
  const hasMultipleImages = images.length > 1;
  const currentImage = images[currentImageIndex];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(property.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description.slice(0, 100) + '...',
          url: `/properties/${property.slug}`,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  if (variant === 'compact') {
    return (
      <Link 
        href={`/properties/${property.slug}`}
        className="group flex gap-4 p-3 bg-white rounded-lg border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all duration-200"
      >
        <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-stone-100">
          {currentImage ? (
            <Image
              src={currentImage.url}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
              <MapPin className="w-8 h-8" />
            </div>
          )}
          <span className={cn(
            "absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full uppercase tracking-wide",
            getStatusBadgeStyles(property.status)
          )}>
            {property.status}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-stone-900 truncate group-hover:text-amber-600 transition-colors text-sm">
            {property.title}
          </h3>
          <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {property.location.suburb}, {property.location.city}
          </p>
          
          <div className="flex items-center gap-3 text-xs text-stone-500 mt-2">
            <span className="flex items-center gap-0.5">
              <Bed className="w-3 h-3" /> {property.specs.bedrooms}
            </span>
            <span className="flex items-center gap-0.5">
              <Bath className="w-3 h-3" /> {property.specs.bathrooms}
            </span>
            {property.specs.garages > 0 && (
              <span className="flex items-center gap-0.5">
                <Car className="w-3 h-3" /> {property.specs.garages}
              </span>
            )}
          </div>
          
          <p className="text-sm font-semibold text-amber-600 mt-2">
            {formatCurrency(property.pricing.price)}
            {property.listingType === 'rent' && <span className="text-xs font-normal text-stone-400">/month</span>}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link 
        href={`/properties/${property.slug}`}
        className="group relative block bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-xl hover:border-amber-200 transition-all duration-300"
      >
        {/* Image Gallery */}
        <div className="relative h-72 bg-stone-100 overflow-hidden">
          {currentImage ? (
            <Image
              src={currentImage.url}
              alt={property.title}
              fill
              priority
              className={cn(
                "object-cover transition-all duration-500",
                imageLoaded ? "opacity-100" : "opacity-0 blur-sm",
                "group-hover:scale-105"
              )}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
              <MapPin className="w-16 h-16" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Status Badge */}
          <span className={cn(
            "absolute top-4 left-4 px-3 py-1 text-xs font-medium rounded-full uppercase tracking-wide backdrop-blur-sm",
            getStatusBadgeStyles(property.status)
          )}>
            {property.status}
          </span>
          
          {/* Listing Type Badge */}
          <span className="absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full bg-white/90 text-stone-700 backdrop-blur-sm">
            For {property.listingType}
          </span>
          
          {/* Image Navigation */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronLeft className="w-4 h-4 text-stone-700" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronRight className="w-4 h-4 text-stone-700" />
              </button>
              {/* Image Dots */}
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      idx === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                    )}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Action Buttons */}
          <div className="absolute top-4 right-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleFavorite}
              className={cn(
                "p-2 rounded-full backdrop-blur-sm transition-colors",
                isFavorite ? "bg-red-50 text-red-500" : "bg-white/80 text-stone-600 hover:bg-white"
              )}
            >
              <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/80 text-stone-600 backdrop-blur-sm hover:bg-white transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Price Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-2xl font-bold text-white">
              {formatCurrency(property.pricing.price)}
              {property.listingType === 'rent' && (
                <span className="text-sm font-normal text-white/80">/month</span>
              )}
            </p>
            {property.pricing.negotiable && (
              <p className="text-xs text-white/80">Price negotiable</p>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-1">
            {property.title}
          </h3>
          <p className="text-sm text-stone-500 flex items-center gap-1.5 mt-1">
            <MapPin className="w-4 h-4" />
            {property.location.suburb}, {property.location.city}
          </p>
          
          <div className="flex items-center gap-6 text-sm text-stone-600 mt-4">
            <span className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-amber-500" />
              <span className="font-medium">{property.specs.bedrooms}</span> Beds
            </span>
            <span className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-amber-500" />
              <span className="font-medium">{property.specs.bathrooms}</span> Baths
            </span>
            {property.specs.garages > 0 && (
              <span className="flex items-center gap-1.5">
                <Car className="w-4 h-4 text-amber-500" />
                <span className="font-medium">{property.specs.garages}</span> Garage{property.specs.garages !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-100">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs"
              onClick={(e) => {
                e.preventDefault();
                onEdit?.(property.id);
              }}
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs"
              onClick={(e) => {
                e.preventDefault();
                onSyndicate?.(property.id);
              }}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Syndicate
            </Button>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link 
      href={`/properties/${property.slug}`}
      className="group relative block bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg hover:border-amber-200 transition-all duration-300"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Image Section */}
      <div className="relative h-56 bg-stone-100 overflow-hidden">
        {currentImage ? (
          <Image
            src={currentImage.url}
            alt={property.title}
            fill
            className={cn(
              "object-cover transition-all duration-300",
              imageLoaded ? "opacity-100" : "opacity-0",
              "group-hover:scale-105"
            )}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <MapPin className="w-12 h-12" />
          </div>
        )}
        
        {/* Status Badge */}
        <span className={cn(
          "absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wide",
          getStatusBadgeStyles(property.status)
        )}>
          {property.status}
        </span>
        
        {/* Listing Type */}
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-stone-700">
          For {property.listingType}
        </span>
        
        {/* Image Navigation */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevImage}
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm transition-all hover:bg-white",
                showActions ? "opacity-100" : "opacity-0"
              )}
            >
              <ChevronLeft className="w-4 h-4 text-stone-700" />
            </button>
            <button
              onClick={handleNextImage}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm transition-all hover:bg-white",
                showActions ? "opacity-100" : "opacity-0"
              )}
            >
              <ChevronRight className="w-4 h-4 text-stone-700" />
            </button>
            {/* Image Counter */}
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/50 text-white text-xs">
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className={cn(
            "absolute top-3 right-24 p-1.5 rounded-full transition-all",
            isFavorite 
              ? "bg-red-50 text-red-500 opacity-100" 
              : "bg-white/80 text-stone-600 opacity-0 group-hover:opacity-100 hover:bg-white"
          )}
        >
          <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-xl font-bold text-amber-600">
            {formatCurrency(property.pricing.price)}
            {property.listingType === 'rent' && (
              <span className="text-xs font-normal text-stone-400">/month</span>
            )}
          </p>
          {property.pricing.negotiable && (
            <span className="text-xs text-green-600 font-medium">Negotiable</span>
          )}
        </div>
        
        {/* Title & Location */}
        <h3 className="font-semibold text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-1 text-sm">
          {property.title}
        </h3>
        <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
          <MapPin className="w-3 h-3" />
          {property.location.suburb}, {property.location.city}
        </p>
        
        {/* Specs */}
        <div className="flex items-center gap-4 text-xs text-stone-500 mt-3">
          <span className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5" />
            {property.specs.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5" />
            {property.specs.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Car className="w-3.5 h-3.5" />
            {property.specs.garages}
          </span>
          {property.specs.floorSize && (
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" />
              {property.specs.floorSize}m²
            </span>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-100">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-xs h-8"
            onClick={(e) => {
              e.preventDefault();
              onEdit?.(property.id);
            }}
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-xs h-8"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            View
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-xs h-8"
            onClick={(e) => {
              e.preventDefault();
              onSyndicate?.(property.id);
            }}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1" />
            Syndicate
          </Button>
        </div>
      </div>
    </Link>
  );
}
