// AI Rent Suggestion Engine for PropAgent
// Algorithm-based pricing with configurable factors (simulated AI)

import { Property } from './types';

export interface RentAnalysisInput {
  propertyId?: string;
  propertyType: 'house' | 'apartment' | 'flat' | 'townhouse' | 'room';
  bedrooms: number;
  bathrooms: number;
  parking: number;
  hasGarden: boolean;
  hasPool: boolean;
  hasAirConditioning: boolean;
  hasSecurity: boolean;
  hasFurnished: boolean;
  squareMeters?: number;
  location: {
    suburb?: string;
    city: string;
    province: string;
  };
  currentRent?: number;
  availableDate?: string;
}

export interface RentComparable {
  id: string;
  title: string;
  address: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  distance: number; // km
  similarityScore: number;
}

export interface RentPriceHistory {
  date: string;
  rent: number;
  event: 'initial' | 'adjustment' | 'market_update';
}

export interface RentSuggestion {
  propertyId: string;
  analysisDate: string;
  
  // Rent recommendations
  minRent: number;
  marketRent: number;
  maxRent: number;
  
  // Price breakdown
  baseRent: number;
  locationAdjustment: number;
  propertyFeaturesAdjustment: number;
  seasonalAdjustment: number;
  marketAdjustment: number;
  
  // Analysis details
  comparables: RentComparable[];
  priceHistory: RentPriceHistory[];
  confidence: 'low' | 'medium' | 'high';
  confidenceFactors: string[];
  
  // Recommendations
  recommendations: string[];
  recommendedDaysOnMarket: number;
  pricePerSqm?: number;
}

// Seasonal factors by month (South Africa)
const SEASONAL_FACTORS: Record<number, number> = {
  1: -0.05,  // January - slower
  2: -0.03,  // February
  3: 0.00,   // March
  4: 0.02,   // April
  5: 0.05,   // May - mid-year boost
  6: 0.03,   // June
  7: 0.00,   // July
  8: 0.02,   // August
  9: 0.05,   // September - spring
  10: 0.08, // October - peak
  11: 0.05, // November
  12: -0.02, // December - holiday
};

// Area base rent averages (R/month) by province and city
const AREA_BASE_RENTS: Record<string, Record<string, Record<string, number>>> = {
  gauteng: {
    johannesburg: {
      sandton: 18000,
      rosebank: 15000,
      'northcliff': 12000,
      'soweto': 6000,
      'alexandra': 5000,
      'johannesburg_central': 11000,
      'braamfontein': 9000,
      'melville': 10000,
      'parktown': 13000,
    },
    pretoria: {
      pretoria_central: 12000,
      'sunderland_ridge': 14000,
      'centurion': 13000,
      'saxonsdal': 11000,
      'garsfontein': 10000,
    },
    sandton: {
      fourways: 20000,
      'dainfern': 22000,
      'kyalami': 18000,
    },
  },
  kwazulu_natal: {
    durban: {
      umhlanga: 16000,
      ballito: 14000,
      durban_central: 9000,
      musgrave: 10000,
      'glenwood': 8500,
      'victoria_emerald': 18000,
    },
    pietermaritzburg: {
      'city_central': 7000,
      'scottburg': 5500,
    },
  },
  western_cape: {
    cape_town: {
      'cbd': 15000,
      'sea_point': 18000,
      'vantage_bay': 16000,
      'bellville': 10000,
      'stellenbosch': 12000,
      'kalk_bay': 14000,
      'claremont': 11000,
    },
    'garden_route': {
      'knysna': 10000,
      'plettenberg_bay': 12000,
    },
  },
  mpumalanga: {
    nelspruit: {
      nelspruit_central: 8000,
      'river_cr': 9000,
    },
  },
  limpopo: {
    polokwane: {
      polokwane_central: 6500,
    },
  },
};

// Property type base multipliers
const PROPERTY_TYPE_MULTIPLIERS: Record<string, number> = {
  house: 1.0,
  townhouse: 0.85,
  apartment: 0.75,
  flat: 0.65,
  room: 0.35,
};

// Feature adjustments
const FEATURE_ADJUSTMENTS: Record<string, number> = {
  garden: 500,
  pool: 800,
  air_conditioning: 400,
  security: 300,
  furnished: 600,
  parking: 200,
};

// Bedroom adjustments
function getBedroomAdjustment(bedrooms: number): number {
  const baseAmount = 2500;
  if (bedrooms <= 1) return 0;
  return (bedrooms - 1) * baseAmount;
}

// Bathroom adjustments
function getBathroomAdjustment(bathrooms: number): number {
  const baseAmount = 1500;
  if (bathrooms <= 1) return 0;
  return (bathrooms - 1) * baseAmount;
}

// Get area base rent
function getAreaBaseRent(province: string, city: string, suburb?: string): number {
  const provinceKey = province.toLowerCase().replace(' ', '_') as keyof typeof AREA_BASE_RENTS;
  const cityKey = city.toLowerCase().replace(' ', '_') as keyof typeof AREA_BASE_RENTS[typeof provinceKey];
  
  if (!AREA_BASE_RENTS[provinceKey]) {
    return 10000; // Default fallback
  }
  
  const cityData = AREA_BASE_RENTS[provinceKey][cityKey];
  if (!cityData) {
    return 10000;
  }
  
  if (suburb) {
    const suburbKey = suburb.toLowerCase().replace(' ', '_') as keyof typeof cityData;
    return cityData[suburbKey] || Object.values(cityData)[0] || 10000;
  }
  
  return Object.values(cityData)[0] || 10000;
}

// Calculate similarity score between properties
function calculateSimilarity(
  input: RentAnalysisInput,
  comparable: { bedrooms: number; bathrooms: number; parking: number; hasGarden: boolean; type: string }
): number {
  let score = 100;
  
  // Bedroom similarity (40% weight)
  const bedroomDiff = Math.abs(input.bedrooms - comparable.bedrooms);
  score -= bedroomDiff * 15;
  
  // Bathroom similarity (30% weight)
  const bathroomDiff = Math.abs(input.bathrooms - comparable.bathrooms);
  score -= bathroomDiff * 20;
  
  // Property type match (20% weight)
  if (input.propertyType !== comparable.type) {
    score -= 20;
  }
  
  // Parking match (10% weight)
  const parkingDiff = Math.abs(input.parking - comparable.parking);
  score -= parkingDiff * 5;
  
  return Math.max(0, Math.min(100, score));
}

// Generate sample comparables
function generateComparables(input: RentAnalysisInput): RentComparable[] {
  const baseRent = getAreaBaseRent(input.location.province, input.location.city, input.location.suburb);
  const typeMultiplier = PROPERTY_TYPE_MULTIPLIERS[input.propertyType] || 0.8;
  const baseWithType = baseRent * typeMultiplier;
  const bedroomAdj = getBedroomAdjustment(input.bedrooms);
  const bathroomAdj = getBathroomAdjustment(input.bathrooms);
  const featureAdj = 
    (input.hasGarden ? FEATURE_ADJUSTMENTS.garden : 0) +
    (input.hasPool ? FEATURE_ADJUSTMENTS.pool : 0) +
    (input.hasAirConditioning ? FEATURE_ADJUSTMENTS.air_conditioning : 0) +
    (input.hasSecurity ? FEATURE_ADJUSTMENTS.security : 0) +
    (input.hasFurnished ? FEATURE_ADJUSTMENTS.furnished : 0) +
    (input.parking * FEATURE_ADJUSTMENTS.parking);
  
  const marketRent = baseWithType + bedroomAdj + bathroomAdj + featureAdj;
  
  // Generate 5 comparable properties with slight variations
  const comparables: RentComparable[] = [];
  const variations = [-0.15, -0.08, 0, 0.08, 0.15];
  
  variations.forEach((variation, index) => {
    const comparableBedrooms = input.bedrooms + (index - 2);
    const comparableBathrooms = Math.max(1, input.bathrooms + Math.floor((index - 2) / 2));
    
    comparables.push({
      id: `comp-${index + 1}`,
      title: `${input.propertyType === 'house' ? 'House' : 'Apartment'} in ${input.location.suburb || input.location.city}`,
      address: `${index + 1} ${['Oak', 'Maple', 'Pine', 'Willow', 'Cedar'][index]} Street`,
      rent: Math.round(marketRent * (1 + variation)),
      bedrooms: comparableBedrooms,
      bathrooms: comparableBathrooms,
      distance: Math.abs(index - 2) * 0.5,
      similarityScore: calculateSimilarity(input, {
        bedrooms: comparableBedrooms,
        bathrooms: comparableBathrooms,
        parking: input.parking,
        hasGarden: input.hasGarden,
        type: input.propertyType,
      }),
    });
  });
  
  return comparables.sort((a, b) => b.similarityScore - a.similarityScore);
}

// Main AI rent suggestion function
export function generateRentSuggestion(input: RentAnalysisInput): RentSuggestion {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  
  // 1. Calculate base rent from area
  const areaBaseRent = getAreaBaseRent(input.location.province, input.location.city, input.location.suburb);
  const propertyTypeMultiplier = PROPERTY_TYPE_MULTIPLIERS[input.propertyType] || 0.8;
  const baseRent = Math.round(areaBaseRent * propertyTypeMultiplier);
  
  // 2. Property features adjustment
  const bedroomAdjustment = getBedroomAdjustment(input.bedrooms);
  const bathroomAdjustment = getBathroomAdjustment(input.bathrooms);
  const parkingAdjustment = input.parking * FEATURE_ADJUSTMENTS.parking;
  const gardenAdjustment = input.hasGarden ? FEATURE_ADJUSTMENTS.garden : 0;
  const poolAdjustment = input.hasPool ? FEATURE_ADJUSTMENTS.pool : 0;
  const acAdjustment = input.hasAirConditioning ? FEATURE_ADJUSTMENTS.air_conditioning : 0;
  const securityAdjustment = input.hasSecurity ? FEATURE_ADJUSTMENTS.security : 0;
  const furnishedAdjustment = input.hasFurnished ? FEATURE_ADJUSTMENTS.furnished : 0;
  
  const propertyFeaturesAdjustment = 
    bedroomAdjustment + 
    bathroomAdjustment + 
    parkingAdjustment + 
    gardenAdjustment + 
    poolAdjustment + 
    acAdjustment + 
    securityAdjustment + 
    furnishedAdjustment;
  
  // 3. Calculate market rent
  const preSeasonalRent = baseRent + propertyFeaturesAdjustment;
  
  // 4. Seasonal adjustment
  const seasonalFactor = SEASONAL_FACTORS[currentMonth] || 0;
  const seasonalAdjustment = Math.round(preSeasonalRent * seasonalFactor);
  
  // 5. Market adjustment (based on local market conditions - simulated)
  const marketConditionFactor = 0.02; // 2% market increase
  const marketAdjustment = Math.round(preSeasonalRent * marketConditionFactor);
  
  // 6. Calculate final rent components
  const locationAdjustment = baseRent - (areaBaseRent * propertyTypeMultiplier);
  
  // 7. Calculate final market rent
  const marketRent = preSeasonalRent + seasonalAdjustment + marketAdjustment;
  
  // 8. Calculate rent range (±15%)
  const minRent = Math.round(marketRent * 0.85);
  const maxRent = Math.round(marketRent * 1.15);
  
  // 9. Generate comparables
  const comparables = generateComparables(input);
  
  // 10. Generate price history (simulated)
  const priceHistory: RentPriceHistory[] = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = now.getFullYear();
  
  // Generate 6 months of history
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - 1 - i + 12) % 12;
    const year = currentMonth - i < 1 ? currentYear - 1 : currentYear;
    const seasonalAdj = SEASONAL_FACTORS[monthIndex + 1] || 0;
    
    priceHistory.push({
      date: `${months[monthIndex]} ${year}`,
      rent: Math.round(marketRent * (1 - i * 0.01) * (1 + seasonalAdj)),
      event: i === 5 ? 'initial' : i === 0 ? 'market_update' : 'adjustment',
    });
  }
  
  // 11. Calculate confidence
  let confidenceScore = 70;
  if (comparables.length >= 3) confidenceScore += 10;
  if (input.bedrooms >= 2 && input.bedrooms <= 4) confidenceScore += 5;
  if (input.parking >= 1) confidenceScore += 5;
  if (input.location.suburb) confidenceScore += 10;
  
  const confidence: 'low' | 'medium' | 'high' = 
    confidenceScore >= 90 ? 'high' : 
    confidenceScore >= 75 ? 'medium' : 'low';
  
  // 12. Generate confidence factors
  const confidenceFactors: string[] = [];
  if (comparables.length >= 3) confidenceFactors.push('Multiple comparables available');
  if (input.location.suburb) confidenceFactors.push('Specific suburb data available');
  if (input.bedrooms >= 1 && input.bedrooms <= 4) confidenceFactors.push('Standard bedroom count');
  if (confidenceScore >= 90) confidenceFactors.push('High quality data matches');
  
  // 13. Generate recommendations
  const recommendations: string[] = [];
  
  if (marketRent > input.currentRent) {
    recommendations.push('Consider increasing rent to market rate');
  } else if (marketRent < input.currentRent) {
    recommendations.push('Current rent is above market - consider competitive pricing');
  }
  
  if (seasonalFactor > 0.03) {
    recommendations.push('Peak season approaching - optimal time to list');
  } else if (seasonalFactor < -0.03) {
    recommendations.push('Off-peak season - price competitively for faster uptake');
  }
  
  if (input.hasPool) {
    recommendations.push('Pool adds significant value - highlight in listings');
  }
  if (input.hasSecurity) {
    recommendations.push('Security features justify premium pricing');
  }
  if (input.hasGarden) {
    recommendations.push('Garden appeals to families - good marketing point');
  }
  
  // Calculate recommended days on market
  const baseDays = 30;
  const seasonalBonus = seasonalFactor > 0 ? -7 : seasonalFactor < 0 ? 7 : 0;
  const priceBonus = input.currentRent && input.currentRent < marketRent ? -5 : 0;
  const recommendedDaysOnMarket = Math.max(14, Math.min(60, baseDays + seasonalBonus + priceBonus));
  
  // Calculate price per sqm if available
  const pricePerSqm = input.squareMeters ? Math.round(marketRent / input.squareMeters) : undefined;
  
  return {
    propertyId: input.propertyId || `prop-${Date.now()}`,
    analysisDate: now.toISOString(),
    minRent,
    marketRent,
    maxRent,
    baseRent,
    locationAdjustment,
    propertyFeaturesAdjustment,
    seasonalAdjustment,
    marketAdjustment,
    comparables,
    priceHistory,
    confidence,
    confidenceFactors,
    recommendations,
    recommendedDaysOnMarket,
    pricePerSqm,
  };
}

// Utility function to format rent for display
export function formatRent(amount: number): string {
  return `R${amount.toLocaleString()}`;
}

// Utility function to get rent range string
export function getRentRangeString(suggestion: RentSuggestion): string {
  return `${formatRent(suggestion.minRent)} - ${formatRent(suggestion.maxRent)}`;
}

// Get confidence color
export function getConfidenceColor(confidence: 'low' | 'medium' | 'high'): string {
  switch (confidence) {
    case 'high': return 'text-green-600';
    case 'medium': return 'text-yellow-600';
    case 'low': return 'text-red-600';
    default: return 'text-slate-600';
  }
}

// Get confidence bg color
export function getConfidenceBgColor(confidence: 'low' | 'medium' | 'high'): string {
  switch (confidence) {
    case 'high': return 'bg-green-100';
    case 'medium': return 'bg-yellow-100';
    case 'low': return 'bg-red-100';
    default: return 'bg-slate-100';
  }
}

// Analyze rent competitiveness
export function analyzeCompetitiveness(currentRent: number, suggestion: RentSuggestion): {
  status: 'underpriced' | 'competitive' | 'overpriced';
  percentage: number;
  message: string;
} {
  const diff = ((currentRent - suggestion.marketRent) / suggestion.marketRent) * 100;
  
  if (diff < -10) {
    return {
      status: 'underpriced',
      percentage: Math.abs(diff),
      message: 'Your rent is below market - consider increasing',
    };
  } else if (diff > 10) {
    return {
      status: 'overpriced',
      percentage: diff,
      message: 'Your rent is above market - consider reducing',
    };
  } else {
    return {
      status: 'competitive',
      percentage: Math.abs(diff),
      message: 'Your rent is competitive with market',
    };
  }
}

// Get seasonal recommendation
export function getSeasonalRecommendation(): {
  currentSeason: string;
  factor: number;
  recommendation: string;
} {
  const month = new Date().getMonth() + 1;
  const seasonMap: Record<number, string> = {
    12: 'Summer',
    1: 'Summer',
    2: 'Summer',
    3: 'Autumn',
    4: 'Autumn',
    5: 'Autumn',
    6: 'Winter',
    7: 'Winter',
    8: 'Winter',
    9: 'Spring',
    10: 'Spring',
    11: 'Spring',
  };
  
  const factor = SEASONAL_FACTORS[month] || 0;
  
  let recommendation = '';
  if (factor > 0.05) {
    recommendation = 'Peak season - optimal pricing possible';
  } else if (factor > 0) {
    recommendation = 'Good market conditions';
  } else if (factor > -0.05) {
    recommendation = 'Stable market - competitive pricing recommended';
  } else {
    recommendation = 'Off-peak - consider flexible pricing';
  }
  
  return {
    currentSeason: seasonMap[month],
    factor,
    recommendation,
  };
}