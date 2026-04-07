// Syndication platform types and configuration
// For posting properties to Property24, Private Property, Facebook, Instagram, X, LinkedIn

export type SyndicationPlatform = 
  | 'property24' 
  | 'private_property' 
  | 'facebook' 
  | 'instagram' 
  | 'twitter' 
  | 'linkedin';

export interface PlatformConfig {
  id: SyndicationPlatform;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  apiKey?: string;
  accessToken?: string;
  accountId?: string;
}

export interface SyndicationPost {
  propertyId: string;
  platform: SyndicationPlatform;
  status: 'pending' | 'posted' | 'failed';
  postedAt?: Date;
  postUrl?: string;
  error?: string;
}

export interface PropertyListing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: {
    streetAddress: string;
    suburb: string;
    city: string;
    province: string;
  };
  specs: {
    bedrooms: number;
    bathrooms: number;
    garages: number;
    erfSize?: number;
    floorSize?: number;
  };
  images: string[];
  features: string[];
  listingType: 'sale' | 'rent';
  agent: {
    name: string;
    phone: string;
    email: string;
  };
}

// Default platform configurations
export const defaultPlatforms: PlatformConfig[] = [
  {
    id: 'property24',
    name: 'Property24',
    icon: 'building',
    color: '#FF6B35',
    enabled: false,
  },
  {
    id: 'private_property',
    name: 'Private Property',
    icon: 'home',
    color: '#2ECC71',
    enabled: false,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    enabled: false,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    color: '#E4405F',
    enabled: false,
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: 'twitter',
    color: '#000000',
    enabled: false,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0A66C2',
    enabled: false,
  },
];

// Helper to format property for a specific platform
export function formatPropertyForPlatform(
  property: PropertyListing,
  platform: SyndicationPlatform
): { title: string; description: string; hashtags: string[] } {
  const baseHashtags = [
    '#PropertyForSale',
    '#RealEstate',
    '#SouthAfrica',
    property.location.city,
    property.listingType === 'sale' ? '#ForSale' : '#ForRent',
  ];

  switch (platform) {
    case 'property24':
      return {
        title: `${property.title} - ${property.listingType === 'sale' ? 'For Sale' : 'For Rent'}`,
        description: `${property.specs.bedrooms} bed, ${property.specs.bathrooms} bath, ${property.specs.garages} garage. ${property.location.suburb}, ${property.location.city}.`,
        hashtags: ['#Property24', ...baseHashtags],
      };
    case 'private_property':
      return {
        title: property.title,
        description: `${property.specs.bedrooms}BR/${property.specs.bathrooms}BA in ${property.location.suburb}. R${property.price.toLocaleString()} ${property.listingType === 'sale' ? '(Sale)' : '/month'}.`,
        hashtags: ['#PrivateProperty', ...baseHashtags],
      };
    case 'facebook':
    case 'instagram':
      return {
        title: property.title,
        description: `🔑 ${property.title}\n💰 R${property.price.toLocaleString()}\n📍 ${property.location.suburb}, ${property.location.city}\n🛏 ${property.specs.bedrooms} bed | 🚿 ${property.specs.bathrooms} bath\n\nContact: ${property.agent.phone}`,
        hashtags: [...baseHashtags, '#LuxuryLiving', '#DreamHome'],
      };
    case 'twitter':
      return {
        title: property.title,
        description: `🏠 ${property.title}\n💰 R${property.price.toLocaleString()} - ${property.listingType === 'sale' ? 'For Sale' : 'For Rent'}\n📍 ${property.location.suburb}, ${property.location.city}\n${property.specs.bedrooms}BR ${property.specs.bathrooms}BA`,
        hashtags: baseHashtags.slice(0, 3),
      };
    case 'linkedin':
      return {
        title: property.title,
        description: `Exciting property listing: ${property.title}\n\nPrice: R${property.price.toLocaleString()}\nLocation: ${property.location.suburb}, ${property.location.city}\nDetails: ${property.specs.bedrooms} bedrooms, ${property.specs.bathrooms} bathrooms\n\nContact ${property.agent.name} for more information.`,
        hashtags: ['#RealEstate', '#Property', '#SouthAfrica', '#Investment'],
      };
    default:
      return {
        title: property.title,
        description: property.description,
        hashtags: baseHashtags,
      };
  }
}
