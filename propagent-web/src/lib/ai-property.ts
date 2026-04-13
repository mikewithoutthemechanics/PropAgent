// AI Property Enhancement Utilities
// Generates descriptions, marketing copy, pricing suggestions for properties

export interface PropertyDetails {
  title: string;
  address: string;
  city: string;
  suburb?: string;
  propertyType: 'house' | 'apartment' | 'townhouse' | 'flat' | 'vacant_land';
  bedrooms: number;
  bathrooms: number;
  parking: number;
  erfSize?: number;
  floorArea?: number;
  price: number;
  features?: string[];
  isForSale?: boolean;
}

const PROPERTY_TYPES: Record<string, string> = {
  house: 'stunning home',
  apartment: 'modern apartment',
  townhouse: 'elegant townhouse',
  flat: 'cozy flat',
  vacant_land: 'prime vacant land',
};

const CITIES: Record<string, string> = {
  'Johannesburg': 'Johannesburg',
  'Cape Town': 'Cape Town',
  'Durban': 'Durban',
  'Pretoria': 'Pretoria',
  'Umhlanga': 'Umhlanga',
  'Ballito': 'Ballito',
  'Durban North': 'Durban North',
};

const FEATURE_KEYWORDS: Record<string, string[]> = {
  pool: ['stunning swimming pool', 'private pool', 'resort-style pool'],
  garden: ['lush garden', 'manicured garden', 'private garden oasis'],
  ocean_view: ['breathtaking ocean views', 'stunning sea views', 'panoramic ocean vistas'],
  mountain_view: ['mountain views', 'scenic mountain backdrop'],
  security: ['24/7 security', 'gated community', 'advanced security systems'],
  garage: ['double garage', 'automated garage', 'spacious garage'],
  airConditioning: ['air conditioning', 'climate control', 'central cooling'],
  fireplace: ['cosy fireplace', 'wood-burning fireplace'],
  furnished: ['fully furnished', 'tastefully furnished', 'move-in ready'],
  balcony: ['private balcony', 'sun-drenched balcony', 'entertaining balcony'],
};

export function generateAIDescription(property: PropertyDetails): string {
  const typeDesc = PROPERTY_TYPES[property.propertyType] || 'property';
  const city = CITIES[property.city] || property.city;
  const suburb = property.suburb ? `in ${property.suburb}` : '';
  
  const features = property.features || [];
  const keyFeatures: string[] = [];
  
  for (const feature of features.slice(0, 4)) {
    const keywords = FEATURE_KEYWORDS[feature];
    if (keywords) {
      keyFeatures.push(keywords[Math.floor(Math.random() * keywords.length)]);
    }
  }
  
  const bedroomText = property.bedrooms === 1 ? 'one bedroom' : 
                     property.bedrooms === 2 ? 'two bedrooms' :
                     `${property.bedrooms} bedrooms`;
  
  const bathroomText = property.bathrooms === 1 ? 'one bathroom' : 
                     `${property.bathrooms} bathrooms`;
  
  const parkingText = property.parking >= 2 ? 'ample parking' : 
                     property.parking === 1 ? 'single parking' : 'convenient parking';
  
  const descriptions = [
    `Welcome to this exquisite ${typeDesc} located ${suburb} ${city}. This remarkable property boasts ${bedroomText} and ${bathroomText}, perfect for ${property.isForSale ? 'families and professionals alike' : 'young professionals and couples'}.`,
    
    `Discover the epitome of modern living in this stunning ${typeDesc} situated ${suburb} ${city}. With ${bedroomText}, ${bathroomText}, and ${parkingText}, this home offers the ultimate in comfort and convenience.`,
    
    `This magnificent ${typeDesc} in ${city} represents exceptional value ${suburb}. Featuring ${bedroomText} and ${bathroomText}, complemented by ${keyFeatures.join(', ')} - truly a rare find.`,
  ];
  
  if (keyFeatures.length > 0) {
    descriptions.push(
      `Step into luxury with this ${typeDesc} ${suburb} ${city}. The property features ${keyFeatures.join(', ')}, creating an unparalleled living experience.`
    );
  }
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

export function generateAIListingTitle(property: PropertyDetails): string[] {
  const city = CITIES[property.city] || property.city;
  const suburb = property.suburb || '';
  
  const templates = [
    `${property.bedrooms} Bed ${property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)} in ${suburb || city}`,
    `Stunning ${city} ${property.propertyType} - ${property.bedrooms} Beds`,
    `${suburb ? suburb + ', ' : ''}${city} ${property.isForSale ? 'For Sale' : 'To Let'}: ${property.bedrooms} Bed ${property.propertyType}`,
    `Prime ${property.propertyType} ${property.isForSale ? 'Sale' : 'Rental'} - ${suburb || city}`,
    `${property.bedrooms} Bedroom ${property.propertyType} in ${suburb || city}`,
  ];
  
  return templates;
}

export function generateAIPricing(property: PropertyDetails): {
  suggested: number;
  range: { min: number; max: number };
  reasoning: string[];
} {
  const basePrice = property.price;
  const isForSale = property.isForSale;
  
  let multiplier = 1;
  const reasoning: string[] = [];
  
  if (property.features?.includes('pool')) {
    multiplier += 0.15;
    reasoning.push('Pool adds 10-15% premium');
  }
  if (property.features?.includes('ocean_view')) {
    multiplier += 0.25;
    reasoning.push('Ocean view commands 20-30% premium');
  }
  if (property.features?.includes('security')) {
    multiplier += 0.05;
    reasoning.push('Security adds 5-10% value');
  }
  if (property.features?.includes('garden')) {
    multiplier += 0.08;
    reasoning.push('Garden space adds 5-10%');
  }
  if (property.bedrooms > 3) {
    multiplier += 0.1;
    reasoning.push('Extra bedrooms increase value');
  }
  if (property.erfSize && property.erfSize > 1000) {
    multiplier += 0.1;
    reasoning.push('Larger erf adds premium');
  }
  
  const suggested = Math.round(basePrice * multiplier);
  const variance = isForSale ? 0.08 : 0.1;
  
  return {
    suggested,
    range: {
      min: Math.round(suggested * (1 - variance)),
      max: Math.round(suggested * (1 + variance)),
    },
    reasoning,
  };
}

export function generateAIMarketingCopy(property: PropertyDetails): {
  headline: string;
  bullets: string[];
  cta: string;
} {
  const city = CITIES[property.city] || property.city;
  const suburb = property.suburb || '';
  
  const headlines = [
    `Your Dream ${property.isForSale ? 'Home' : 'Rental'} Awaits in ${city}`,
    `Live ${property.isForSale ? 'Where You Love' : 'in Luxury'} - ${suburb || city}`,
    `${suburb ? suburb + ', ' : ''}${city}: Where Lifestyle Meets Location`,
    `Exceptional Property - Exceptional ${property.isForSale ? 'Investment' : 'Living'}`,
  ];
  
  const bulletTemplates = [
    `Located in the heart of ${suburb || city}`,
    `${property.bedrooms} spacious bedrooms with natural light`,
    `Modern finishes throughout`,
    property.features?.includes('pool') ? 'Private pool for relaxation' : null,
    property.features?.includes('security') ? 'Secure living with advanced systems' : null,
    property.features?.includes('ocean_view') ? 'Stunning views to wake up to' : null,
    `Close to amenities, schools, and transport`,
    `${property.isForSale ? 'Great investment potential' : 'Available for immediate occupation'}`,
  ].filter(Boolean) as string[];
  
  return {
    headline: headlines[Math.floor(Math.random() * headlines.length)],
    bullets: bulletTemplates,
    cta: property.isForSale ? 'Schedule a Viewing Today' : 'Book a Tour Now',
  };
}

export function generateAIFeatureHighlights(property: PropertyDetails): string[] {
  const highlights: string[] = [];
  
  if (property.bedrooms >= 3) {
    highlights.push('Spacious family home');
  } else if (property.bedrooms === 1) {
    highlights.push('Perfect for singles or couples');
  }
  
  if (property.bathrooms >= 2) {
    highlights.push('Multiple bathrooms for convenience');
  }
  
  if (property.parking >= 2) {
    highlights.push('Ample parking for vehicles');
  }
  
  if (property.erfSize && property.erfSize > 500) {
    highlights.push(`Generous ${property.erfSize}sqm erf`));
  }
  
  if (property.floorArea && property.floorArea > 150) {
    highlights.push(`Open-plan living spanning ${property.floorArea}sqm`);
  }
  
  const featureMap: Record<string, string> = {
    pool: 'Stunning pool area',
    garden: 'Private garden retreat',
    ocean_view: 'Ocean views',
    mountain_view: 'Mountain panorama',
    security: 'Secure complex',
    airConditioning: 'Climate controlled',
    fireplace: 'Cozy fireplace',
    furnished: 'Move-in ready',
    balcony: 'Entertainment balcony',
    garage: 'Covered parking',
  };
  
  for (const feature of property.features || []) {
    if (featureMap[feature]) {
      highlights.push(featureMap[feature]);
    }
  }
  
  return highlights.slice(0, 6);
}

export function generateSEODescription(property: PropertyDetails): string {
  const city = CITIES[property.city] || property.city;
  const suburb = property.suburb || '';
  
  return `${property.bedrooms} Bedroom ${property.propertyType} ${suburb ? 'in ' + suburb + ', ' : 'in ' + city} ${property.isForSale ? 'For Sale' : 'For Rent'}. ${property.bedrooms} beds, ${property.bathrooms} baths, ${property.parking} parking. Price: R${property.price.toLocaleString()}. View now!`;
}