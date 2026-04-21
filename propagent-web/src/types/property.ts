// Property Types for agent-loop Real Estate Platform

export type PropertyType = 'house' | 'apartment' | 'flat' | 'townhouse' | 'duplex' | 'penthouse' | 'commercial' | 'industrial' | 'land' | 'vacant_land';

export type PropertyStatus = 'active' | 'pending' | 'sold' | 'rented' | 'withdrawn' | 'draft' | 'under_offer';

export type ListingType = 'sale' | 'rent' | 'auction';

export type Province = 'gauteng' | 'western_cape' | 'kwazulu_natal' | 'eastern_cape' | 'free_state' | 'mpumalanga' | 'limpopo' | 'north_west' | 'northern_cape';

export interface PropertyImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
}

export interface PropertyFeatures {
  pool: boolean;
  garden: boolean;
  securitySystem: boolean;
  borehole: boolean;
  solarPanels: boolean;
  backupPower: boolean;
  airConditioning: boolean;
  furnished: boolean;
  petFriendly: boolean;
  wheelchairAccess: boolean;
  balcony: boolean;
  fireplace: boolean;
  staffQuarters: boolean;
  flatlet: boolean;
  tennisCourt: boolean;
  gym: boolean;
  elevator: boolean;
}

export interface PropertyPricing {
  price: number;
  negotiable: boolean;
  levies?: number;
  ratesAndTaxes?: number;
  transferDuty?: number;
  bondRegistration?: number;
  depositRequired?: number;
  depositMonths?: number;
}

export interface PropertyLocation {
  streetAddress: string;
  suburb: string;
  city: string;
  province: Province;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  complexName?: string;
  unitNumber?: string;
}

export interface PropertySpecs {
  bedrooms: number;
  bathrooms: number;
  garages: number;
  carports?: number;
  totalParking?: number;
  erfSize?: number; // in square meters
  floorSize?: number; // in square meters
  landSize?: number; // in square meters
  yearBuilt?: number;
}

export interface PropertyAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  agencyName: string;
  agencyLogo?: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  listingType: ListingType;
  type: PropertyType;
  status: PropertyStatus;
  location: PropertyLocation;
  pricing: PropertyPricing;
  specs: PropertySpecs;
  features: PropertyFeatures;
  images: PropertyImage[];
  agent: PropertyAgent;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  expiresAt?: string;
  
  // Statistics
  viewCount: number;
  inquiryCount: number;
  favoriteCount: number;
  
  // Syndication
  syndicatedTo: string[];
  
  // SEO
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  
  // Draft auto-save
  lastDraftSave?: string;
  isDraft: boolean;
}

// Filter Types
export interface PropertyFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyTypes?: PropertyType[];
  listingType?: ListingType;
  features?: Partial<PropertyFeatures>;
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc' | 'featured' | 'views';
}

// Form Types
export interface PropertyFormData {
  title: string;
  description: string;
  listingType: ListingType;
  type: PropertyType;
  location: PropertyLocation;
  pricing: PropertyPricing;
  specs: PropertySpecs;
  features: PropertyFeatures;
}

// Dashboard Types
export interface PropertyStats {
  totalListings: number;
  activeListings: number;
  draftListings: number;
  soldListings: number;
  rentedListings: number;
  pendingListings: number;
  totalViews: number;
  viewsThisWeek: number;
  totalInquiries: number;
  inquiriesThisWeek: number;
  averageDaysOnMarket: number;
}

export interface RecentInquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage?: string;
  inquirerName: string;
  inquirerEmail: string;
  inquirerPhone?: string;
  message: string;
  status: 'new' | 'contacted' | 'viewing_scheduled' | 'converted' | 'closed';
  createdAt: string;
}

export interface PropertySearchResult {
  properties: Property[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PropertyListResponse {
  properties: Property[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  facets?: {
    types: Record<PropertyType, number>;
    suburbs: Record<string, number>;
    priceRanges: { min: number; max: number; count: number }[];
  };
}
