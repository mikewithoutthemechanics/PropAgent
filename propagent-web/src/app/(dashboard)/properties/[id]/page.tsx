'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, Bed, Bath, Car, Maximize, Calendar, MapPin, 
  Share2, Heart, Phone, Mail, MessageSquare, ChevronLeft, 
  ChevronRight, X, ExternalLink, Home, Check, Edit3, Eye
} from 'lucide-react';
import { sampleProperties, getSimilarProperties } from '@/lib/sample-data';
import { Button, Card } from '@/components/ui';
import { formatCurrency, getStatusBadgeStyles, cn } from '@/lib/utils';
import { PropertyCard } from '@/components/properties/PropertyCard';

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.id as string;
  
  // In a real app, fetch property by ID from API
  // For demo, we'll use the sample data
  const property = sampleProperties.find(p => p.id === propertyId) || sampleProperties[0];
  const similarProperties = getSimilarProperties(property.id, 3);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev === 0 ? property.images.length - 1 : prev - 1));
  }, [property.images.length]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev === property.images.length - 1 ? 0 : prev + 1));
  }, [property.images.length]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description.slice(0, 100) + '...',
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    }
  };

  const currentImage = property.images[currentImageIndex];
  const hasMultipleImages = property.images.length > 1;

  // Feature categories for display
  const featureCategories = [
    {
      title: 'Interior Features',
      features: [
        { key: 'airConditioning', label: 'Air Conditioning' },
        { key: 'furnished', label: 'Furnished' },
        { key: 'fireplace', label: 'Fireplace' },
        { key: 'elevator', label: 'Elevator' },
      ],
    },
    {
      title: 'Exterior Features',
      features: [
        { key: 'pool', label: 'Swimming Pool' },
        { key: 'garden', label: 'Garden' },
        { key: 'balcony', label: 'Balcony' },
        { key: 'tennisCourt', label: 'Tennis Court' },
      ],
    },
    {
      title: 'Security & Utilities',
      features: [
        { key: 'securitySystem', label: 'Security System' },
        { key: 'borehole', label: 'Borehole' },
        { key: 'solarPanels', label: 'Solar Panels' },
        { key: 'backupPower', label: 'Backup Power' },
      ],
    },
    {
      title: 'Additional Features',
      features: [
        { key: 'staffQuarters', label: 'Staff Quarters' },
        { key: 'flatlet', label: 'Flatlet / Cottage' },
        { key: 'gym', label: 'Gym' },
        { key: 'wheelchairAccess', label: 'Wheelchair Access' },
        { key: 'petFriendly', label: 'Pet Friendly' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link 
          href="/properties"
          className="flex items-center gap-2 text-charcoal-600 hover:text-charcoal-900 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Properties
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1.5" />
            Share
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFavorite(!isFavorite)}
            className={cn(isFavorite && "text-red-500 border-red-200 bg-red-50")}
          >
            <Heart className={cn("w-4 h-4 mr-1.5", isFavorite && "fill-current")} />
            {isFavorite ? 'Saved' : 'Save'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => alert('Edit functionality coming soon!')}>
            <Edit3 className="w-4 h-4 mr-1.5" />
            Edit
          </Button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative rounded-2xl overflow-hidden bg-charcoal-100">
        <div className="aspect-[16/9] md:aspect-[21/9] relative">
          {currentImage ? (
            <Image
              src={currentImage.url}
              alt={property.title}
              fill
              priority
              className="object-cover cursor-pointer transition-all duration-300"
              onClick={() => setIsLightboxOpen(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-charcoal-300 transition-all duration-300">
              <Home className="w-24 h-24" />
            </div>
          )}
          
          {/* Status Badge */}
          <span className={cn(
            "absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-medium uppercase tracking-wide",
            getStatusBadgeStyles(property.status)
          )}>
            {property.status}
          </span>
          
          {/* Image Navigation */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-lg cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-charcoal-700" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-lg cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 text-charcoal-700" />
              </button>
              
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 text-white text-sm">
                {currentImageIndex + 1} / {property.images.length}
              </div>
            </>
          )}
        </div>
        
        {/* Thumbnail Strip */}
        {property.images.length > 1 && (
          <div className="flex gap-2 p-4 bg-white border-t border-charcoal-200 overflow-x-auto">
            {property.images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setCurrentImageIndex(idx)}
                className={cn(
                  "relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-300 cursor-pointer",
                  idx === currentImageIndex ? "border-navy-500" : "border-transparent hover:border-charcoal-300"
                )}
              >
                <Image
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Property Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title & Price */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-charcoal-100 text-navy-700 text-xs font-medium uppercase">
                For {property.listingType}
              </span>
              <span className="flex items-center gap-1 text-sm text-charcoal-500">
                <Eye className="w-4 h-4" />
                {property.viewCount.toLocaleString()} views
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-2">
              {property.title}
            </h1>
            <p className="text-charcoal-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {property.location.streetAddress}, {property.location.suburb}, {property.location.city}
            </p>
            
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl md:text-4xl font-bold text-navy-600">
                {formatCurrency(property.pricing.price)}
              </span>
              {property.listingType === 'rent' && (
                <span className="text-charcoal-400">/month</span>
              )}
              {property.pricing.negotiable && (
                <span className="text-green-600 text-sm font-medium">Price Negotiable</span>
              )}
            </div>
          </div>

          {/* Key Specs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-charcoal-50 rounded-xl">
              <div className="p-2 bg-lime-100 rounded-lg">
                <Bed className="w-5 h-5 text-navy-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-charcoal-900">{property.specs.bedrooms}</p>
                <p className="text-xs text-charcoal-500">Bedrooms</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-charcoal-50 rounded-xl">
              <div className="p-2 bg-lime-100 rounded-lg">
                <Bath className="w-5 h-5 text-navy-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-charcoal-900">{property.specs.bathrooms}</p>
                <p className="text-xs text-charcoal-500">Bathrooms</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-charcoal-50 rounded-xl">
              <div className="p-2 bg-lime-100 rounded-lg">
                <Car className="w-5 h-5 text-navy-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-charcoal-900">{property.specs.garages}</p>
                <p className="text-xs text-charcoal-500">Garages</p>
              </div>
            </div>
            {property.specs.floorSize && (
              <div className="flex items-center gap-3 p-4 bg-charcoal-50 rounded-xl">
                <div className="p-2 bg-lime-100 rounded-lg">
                  <Maximize className="w-5 h-5 text-navy-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-charcoal-900">{property.specs.floorSize}</p>
                  <p className="text-xs text-charcoal-500">m² Floor</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-charcoal-900 mb-3">Description</h2>
            <p className="text-charcoal-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Property Details */}
          <div>
            <h2 className="text-lg font-semibold text-charcoal-900 mb-3">Property Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex justify-between py-2 border-b border-charcoal-100">
                <span className="text-charcoal-500">Property Type</span>
                <span className="font-medium text-charcoal-900 capitalize">{property.type}</span>
              </div>
              {property.specs.yearBuilt && (
                <div className="flex justify-between py-2 border-b border-charcoal-100">
                  <span className="text-charcoal-500">Year Built</span>
                  <span className="font-medium text-charcoal-900">{property.specs.yearBuilt}</span>
                </div>
              )}
              {property.specs.erfSize && (
                <div className="flex justify-between py-2 border-b border-charcoal-100">
                  <span className="text-charcoal-500">Erf Size</span>
                  <span className="font-medium text-charcoal-900">{property.specs.erfSize} m²</span>
                </div>
              )}
              {property.pricing.levies !== undefined && (
                <div className="flex justify-between py-2 border-b border-charcoal-100">
                  <span className="text-charcoal-500">Levies</span>
                  <span className="font-medium text-charcoal-900">{formatCurrency(property.pricing.levies || 0)}/month</span>
                </div>
              )}
              {property.pricing.ratesAndTaxes !== undefined && (
                <div className="flex justify-between py-2 border-b border-charcoal-100">
                  <span className="text-charcoal-500">Rates & Taxes</span>
                  <span className="font-medium text-charcoal-900">{formatCurrency(property.pricing.ratesAndTaxes || 0)}/month</span>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-lg font-semibold text-charcoal-900 mb-3">Features & Amenities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featureCategories.map((category) => {
                const activeFeatures = category.features.filter(
                  f => property.features[f.key as keyof typeof property.features]
                );
                if (activeFeatures.length === 0) return null;
                
                return (
                  <div key={category.title}>
                    <h3 className="text-sm font-medium text-charcoal-500 mb-2">{category.title}</h3>
                    <ul className="space-y-2">
                      {activeFeatures.map(feature => (
                        <li key={feature.key} className="flex items-center gap-2 text-charcoal-700">
                          <Check className="w-4 h-4 text-green-500" />
                          {feature.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Similar Properties */}
          {similarProperties.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-charcoal-900 mb-4">Similar Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {similarProperties.map(p => (
                  <PropertyCard key={p.id} property={p} variant="compact" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Agent & Contact */}
        <div className="space-y-6">
          {/* Agent Card */}
          <Card className="p-6">
            <h3 className="font-semibold text-charcoal-900 mb-4">Listed By</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-charcoal-200 overflow-hidden">
                {property.agent.avatarUrl ? (
                  <Image
                    src={property.agent.avatarUrl}
                    alt={property.agent.name}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-charcoal-400">
                    <Home className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-charcoal-900">{property.agent.name}</p>
                <p className="text-sm text-charcoal-500">{property.agent.agencyName}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <a 
                href={`tel:${property.agent.phone}`}
                className="flex items-center gap-2 p-3 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 transition-all duration-300 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-navy-500" />
                <span className="text-sm font-medium text-charcoal-700">{property.agent.phone}</span>
              </a>
              <a 
                href={`mailto:${property.agent.email}`}
                className="flex items-center gap-2 p-3 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 transition-all duration-300 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-navy-500" />
                <span className="text-sm font-medium text-charcoal-700">{property.agent.email}</span>
              </a>
            </div>
          </Card>

          {/* Schedule Viewing Card */}
          <Card className="p-6 bg-lime-50 border-lime-200">
            <h3 className="font-semibold text-charcoal-900 mb-2">Interested in this property?</h3>
            <p className="text-sm text-charcoal-600 mb-4">
              Schedule a viewing or request more information from the agent.
            </p>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => setShowContactForm(true)}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Viewing
              </Button>
              <Button variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </Card>

          {/* Syndication Status */}
          <Card className="p-6">
            <h3 className="font-semibold text-charcoal-900 mb-3">Syndicated To</h3>
            <div className="flex flex-wrap gap-2">
              {property.syndicatedTo.map(platform => (
                <span 
                  key={platform}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full"
                >
                  <ExternalLink className="w-3 h-3" />
                  {platform}
                </span>
              ))}
            </div>
          </Card>

          {/* Property Stats */}
          <Card className="p-6">
            <h3 className="font-semibold text-charcoal-900 mb-3">Listing Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-charcoal-500 text-sm">Total Views</span>
                <span className="font-medium text-charcoal-900">{property.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500 text-sm">Inquiries</span>
                <span className="font-medium text-charcoal-900">{property.inquiryCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500 text-sm">Favorites</span>
                <span className="font-medium text-charcoal-900">{property.favoriteCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500 text-sm">Listed On</span>
                <span className="font-medium text-charcoal-900">
                  {new Date(property.publishedAt || property.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
          >
            <X className="w-8 h-8" />
          </button>
          
          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
          
          <div className="relative w-full h-full max-w-6xl max-h-screen p-8">
            {currentImage && (
              <Image
                src={currentImage.url}
                alt={property.title}
                fill
                className="object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
          
          {/* Thumbnail strip in lightbox */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {property.images.map((img, idx) => (
              <button
                key={img.id}
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                className={cn(
                  "relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                  idx === currentImageIndex ? "border-white" : "border-transparent opacity-50 hover:opacity-100"
                )}
              >
                <Image
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
