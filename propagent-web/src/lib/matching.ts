// Property Matching Algorithm for AgentPing
// POPIA-compliant: criteria-only matching, no client data stored on servers
// Supports both RENTAL (tenants) and SALES (buyers)

export interface BuyerCriteria {
  id: string;
  agentId: string;
  budget: {
    min: number;
    max: number;
  };
  location: {
    suburb?: string;
    city?: string;
    province?: string;
  };
  bedrooms: number;
  propertyTypes: ('house' | 'apartment' | 'townhouse' | 'flat' | 'vacant_land')[];
  purchaseType: 'primary' | 'investment' | 'upgrade';
  hasBond: boolean;
  preApproval: boolean;
  requiredFeatures: ('pool' | 'garage' | 'garden' | 'security' | 'ocean_view')[];
  dateCreated: string;
}

export interface SalePropertyMatch {
  propertyId: string;
  propertyTitle: string;
  matchScore: number;
  matchReasons: string[];
}

export interface TenantCriteria {
  id: string;
  agentId: string;
  budget: {
    min: number;
    max: number;
  };
  location: {
    suburb?: string;
    city?: string;
    province?: string;
  };
  bedrooms: number;
  urgency: 'immediate' | '30_days' | '60_days' | '90_days';
  propertyTypes: ('apartment' | 'house' | 'townhouse' | 'flat' | 'room')[];
  hasPets: boolean;
  employmentStatus: 'employed' | 'self_employed' | 'business_owner';
  dateCreated: string;
}

export interface PropertyMatch {
  propertyId: string;
  propertyTitle: string;
  matchScore: number;
  matchReasons: string[];
}

// Urgency scoring weights
const URGENCY_WEIGHTS = {
  'immediate': 100,
  '30_days': 75,
  '60_days': 50,
  '90_days': 25,
};

// Budget overlap calculation
function calculateBudgetScore(criteria: TenantCriteria, propertyPrice: number): number {
  const { min, max } = criteria.budget;
  
  // Perfect match (property within budget range)
  if (propertyPrice >= min && propertyPrice <= max) {
    return 100;
  }
  
  // Partial match - property below minimum (can afford)
  if (propertyPrice < min) {
    const gap = min - propertyPrice;
    const percentageGap = (gap / min) * 100;
    return Math.max(0, 100 - percentageGap * 2);
  }
  
  // Property above max (stretch budget - less ideal)
  const gap = propertyPrice - max;
  const percentageGap = (gap / max) * 100;
  return Math.max(0, 100 - percentageGap);
}

// Location matching
function calculateLocationScore(criteria: TenantCriteria, propertyLocation: { suburb: string; city: string; province: string }): number {
  const { suburb, city, province } = criteria.location;
  
  if (suburb && propertyLocation.suburb.toLowerCase() === suburb.toLowerCase()) {
    return 100;
  }
  
  if (city && propertyLocation.city.toLowerCase() === city.toLowerCase()) {
    return 75;
  }
  
  if (province && propertyLocation.province.toLowerCase() === province.toLowerCase()) {
    return 50;
  }
  
  return 0;
}

// Bedroom matching
function calculateBedroomScore(criteriaBedrooms: number, propertyBedrooms: number): number {
  const diff = propertyBedrooms - criteriaBedrooms;
  
  if (diff === 0) return 100; // Exact match
  if (diff === 1) return 90; // One extra bedroom
  if (diff === -1) return 70; // One less (compact)
  if (diff >= 2) return 60; // Much larger than needed
  if (diff <= -2) return 40; // Too small
  
  return 50;
}

// Primary match calculation engine
export function calculatePropertyMatch(
  criteria: TenantCriteria,
  property: {
    id: string;
    title: string;
    pricing: { price: number };
    location: { suburb: string; city: string; province: string };
    specs: { bedrooms: number };
    type: string;
  }
): PropertyMatch | null {
  const matchReasons: string[] = [];
  let totalScore = 0;
  let factorsCount = 0;
  
  // Budget match (40% weight)
  const budgetScore = calculateBudgetScore(criteria, property.pricing.price);
  if (budgetScore >= 80) {
    matchReasons.push('Within budget');
  } else if (budgetScore >= 50) {
    matchReasons.push('Slight budget stretch');
  }
  totalScore += budgetScore * 0.4;
  factorsCount += 1;
  
  // Location match (30% weight)
  const locationScore = calculateLocationScore(criteria, property.location);
  if (locationScore === 100) {
    matchReasons.push('Exact suburb match');
  } else if (locationScore === 75) {
    matchReasons.push('Same city');
  } else if (locationScore === 50) {
    matchReasons.push('Same province');
  }
  totalScore += locationScore * 0.3;
  factorsCount += 1;
  
  // Bedroom match (20% weight)
  const bedroomScore = calculateBedroomScore(criteria.bedrooms, property.specs.bedrooms);
  if (bedroomScore >= 90) {
    matchReasons.push('Bedroom requirements met');
  }
  totalScore += bedroomScore * 0.2;
  factorsCount += 1;
  
  // Property type match (10% weight)
  let typeScore = 50; // Neutral if no preference
  if (criteria.propertyTypes.length > 0) {
    const propertyTypeMap: Record<string, string> = {
      'apartment': 'apartment',
      'flat': 'apartment',
      'house': 'house',
      'townhouse': 'townhouse',
    };
    const normalizedType = propertyTypeMap[property.type] || property.type;
    if (criteria.propertyTypes.includes(normalizedType as any)) {
      typeScore = 100;
      matchReasons.push('Property type matches');
    }
  }
  totalScore += typeScore * 0.1;
  
  // Only return matches with score >= 60
  if (totalScore < 60) {
    return null;
  }
  
  return {
    propertyId: property.id,
    propertyTitle: property.title,
    matchScore: Math.round(totalScore),
    matchReasons,
  };
}

// Sort matches by score and urgency
export function rankMatches(matches: PropertyMatch[], criteriaUrgency: TenantCriteria['urgency']): PropertyMatch[] {
  const urgencyBoost = URGENCY_WEIGHTS[criteriaUrgency] / 100;
  
  return [...matches].sort((a, b) => {
    const boostedA = a.matchScore * (1 + urgencyBoost * 0.2);
    const boostedB = b.matchScore * (1 + urgencyBoost * 0.2);
    return boostedB - boostedA;
  });
}

// Agent ping notification trigger
export function shouldNotifyAgent(matchScore: number, urgency: TenantCriteria['urgency']): boolean {
  // High urgency + good match = instant notification
  if (urgency === 'immediate' && matchScore >= 80) return true;
  
  // Good match regardless
  if (matchScore >= 85) return true;
  
  // Decent match with imminent need
  if (matchScore >= 70 && urgency === 'immediate') return true;
  
  return false;
}

// POPIA compliance: Hash criteria to prevent client identification
export function hashCriteria(criteria: TenantCriteria): string {
  const data = `${criteria.budget.min}-${criteria.budget.max}-${criteria.dateCreated}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// SALES MATCHING ALGORITHM

const PURCHASE_TYPE_WEIGHTS = {
  'primary': 100,
  'investment': 85,
  'upgrade': 75,
};

const FEATURE_WEIGHTS = {
  'pool': 15,
  'garage': 10,
  'garden': 8,
  'security': 12,
  'ocean_view': 20,
};

function calculateBuyerBudgetScore(criteria: BuyerCriteria, propertyPrice: number): number {
  const { min, max } = criteria.budget;
  if (propertyPrice >= min && propertyPrice <= max) return 100;
  if (propertyPrice < min) return Math.max(0, 100 - ((min - propertyPrice) / min) * 100 * 1.5);
  return Math.max(0, 100 - ((propertyPrice - max) / max) * 100);
}

function calculateBedroomScore(criteria: BuyerCriteria, propertyBedrooms: number): number {
  if (propertyBedrooms >= criteria.bedrooms) return 100;
  const diff = criteria.bedrooms - propertyBedrooms;
  return Math.max(0, 100 - diff * 25);
}

function calculateLocationScore(criteria: BuyerCriteria, propertyCity: string, propertySuburb: string): number {
  if (!criteria.location?.city && !criteria.location?.suburb) return 100;
  if (criteria.location.city === propertyCity) return 100;
  if (criteria.location.suburb === propertySuburb) return 90;
  return 50;
}

function calculateFeaturesScore(criteria: BuyerCriteria, propertyFeatures: string[]): number {
  if (!criteria.requiredFeatures?.length) return 100;
  const matched = criteria.requiredFeatures.filter(f => propertyFeatures.includes(f)).length;
  return (matched / criteria.requiredFeatures.length) * 100;
}

export function matchBuyersToProperties(
  properties: { id: string; title: string; price: number; bedrooms: number; city: string; suburb: string; features: string[] }[],
  criteria: BuyerCriteria
): SalePropertyMatch[] {
  const purchaseWeight = PURCHASE_TYPE_WEIGHTS[criteria.purchaseType] || 75;
  const preApprovalBonus = criteria.preApproval ? 10 : 0;
  const hasBondBonus = criteria.hasBond ? 5 : 0;
  
  const matches = properties.map(property => {
    const budgetScore = calculateBuyerBudgetScore(criteria, property.price);
    const bedroomScore = calculateBedroomScore(criteria, property.bedrooms);
    const locationScore = calculateLocationScore(criteria, property.city, property.suburb);
    const featuresScore = calculateFeaturesScore(criteria, property.features || []);
    
    const reasons: string[] = [];
    if (budgetScore >= 85) reasons.push('Within budget');
    if (bedroomScore >= 75) reasons.push('Correct bedrooms');
    if (locationScore >= 90) reasons.push('Preferred area');
    if (featuresScore >= 60) reasons.push('Key features');
    if (preApprovalBonus) reasons.push('Pre-approved');
    if (criteria.hasBond) reasons.push('Bond confirmed');
    
    const baseScore = (
      budgetScore * 0.35 +
      bedroomScore * 0.25 +
      locationScore * 0.25 +
      featuresScore * 0.15
    );
    
    const finalScore = Math.min(100, baseScore + purchaseWeight * 0.1 + preApprovalBonus + hasBondBonus);
    
    return {
      propertyId: property.id,
      propertyTitle: property.title,
      matchScore: Math.round(finalScore),
      matchReasons: reasons,
    };
  });
  
  return matches
    .filter(m => m.matchScore >= 50)
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function calculateBuyerMatchScore(criteria: BuyerCriteria, property: {
  price: number;
  bedrooms: number;
  city: string;
  suburb: string;
  features: string[];
}): number {
  const score = (
    calculateBuyerBudgetScore(criteria, property.price) * 0.35 +
    calculateBedroomScore(criteria, property.bedrooms) * 0.25 +
    calculateLocationScore(criteria, property.city, property.suburb) * 0.25 +
    calculateFeaturesScore(criteria, property.features || []) * 0.15
  );
  return Math.round(score);
}