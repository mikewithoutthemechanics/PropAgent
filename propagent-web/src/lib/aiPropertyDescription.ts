// AI Property Description Generator
// Generates compelling property listings from property details

export interface PropertyDetails {
  type: 'apartment' | 'house' | 'flat' | 'townhouse' | 'room';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  address: string;
  suburb: string;
  city: string;
  features: string[];
  parking: number;
  hasGarden: boolean;
  hasPool: boolean;
  hasSecurity: boolean;
  hasFurnished: boolean;
  rent: number;
}

const featureTemplates: Record<string, string[]> = {
  apartment: [
    "Modern open-plan living",
    "Private balcony with city views",
    "Built-in cupboards",
    "Modern kitchen with appliances"
  ],
  house: [
    "Spacious garden",
    "Private entrance",
    "Off-street parking",
    "Family-friendly layout"
  ],
  flat: [
    "Compact and efficient",
    "Located in secure complex",
    "Low maintenance",
    "Great starter home"
  ],
  townhouse: [
    "Multi-level living",
    "Own title",
    "Community amenities",
    "Gated complex"
  ]
};

export function generatePropertyDescription(property: PropertyDetails): {
  short: string;
  medium: string;
  long: string;
  bulletPoints: string[];
  tags: string[];
} {
  const { type, bedrooms, bathrooms, sqft, suburb, features, parking, hasGarden, hasPool, hasSecurity, hasFurnished, rent } = property;
  
  // Generate short description (50-80 chars)
  const short = `${bedrooms} Bed ${type} in ${suburb} - R${rent.toLocaleString()}/mo`;
  
  // Generate medium description (150-200 chars)
  const medium = `Beautiful ${bedrooms} bedroom ${type} offering ${sqft}sqft of modern living in the heart of ${suburb}. Features ${bathrooms} bathroom${bathrooms > 1 ? 's' : ''}, ${parking} parking${hasGarden ? ', garden access' : ''}${hasPool ? ', pool' : ''}. Ready for immediate occupation.`;
  
  // Generate long description (marketing copy)
  const long = `Welcome to your new home in ${suburb}! This stunning ${bedrooms} bedroom ${type} combines modern design with practical living. The open-plan layout provides ${sqft}sqft of meticulously designed space, perfect for professionals or families.
  
  ${hasSecurity ? 'Enjoy peace of mind with 24/7 security in the complex.' : ''}
  ${hasGarden ? 'Relax in your private garden or enjoy the community green spaces.' : ''}
  ${hasPool ? 'Take a dip in the sparkling pool on hot summer days.' : ''}
  ${hasFurnished ? 'Move-in ready with quality fittings throughout.' : ''}
  
  Location: ${property.address}, ${suburb}, ${property.city}
  Monthly Rent: R${rent.toLocaleString()}
  Available: Immediately
  
  Don't miss this perfect blend of comfort and convenience. Book a viewing today!`;
  
  // Generate bullet points
  const bulletPoints = [
    `${bedrooms} Bedroom ${type}`,
    `${bathrooms} Bathroom${bathrooms > 1 ? 's' : ''}`,
    `${sqft} sqft living space`,
    `${parking} Parking${hasGarden ? ' + Garden' : ''}`,
    hasSecurity ? '24/7 Security' : '',
    hasPool ? 'Pool Access' : '',
    hasFurnished ? 'Fully Furnished' : 'Unfurnished',
    `In ${suburb}`
  ].filter(Boolean);
  
  // Generate tags for search
  const tags = [
    type,
    `${bedrooms}-bed`,
    suburb.toLowerCase(),
    hasSecurity ? 'secure' : '',
    hasPool ? 'pool' : '',
    hasGarden ? 'garden' : '',
    hasFurnished ? 'furnished' : ''
  ].filter(Boolean);
  
  return { short, medium, long, bulletPoints, tags };
}

export function generateSEOPropertyDescription(property: PropertyDetails): string {
  const { type, bedrooms, bathrooms, sqft, suburb, city, rent } = property;
  
  return `Premium ${bedrooms} Bedroom ${type} to Rent in ${suburb}, ${city}. ${sqft}sqft of modern living space featuring ${bathrooms} bathrooms. R${rent.toLocaleString()}/month. Safe, secure, and convenient - your perfect rental home awaits in ${suburb}.`;
}

// Generate variations for A/B testing
export function generateDescriptionVariations(property: PropertyDetails): string[] {
  const base = generatePropertyDescription(property);
  
  return [
    base.short,
    base.medium,
    base.long,
    generateSEOPropertyDescription(property)
  ];
}
