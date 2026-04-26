// Property Valuation Tools for Agent Loop
// AVM (Automated Valuation Model) estimation and comparable analysis
// Placeholder for Lightstone/Windeed integration

export interface PropertyValuation {
  id: string;
  propertyId: string;
  propertyAddress: string;
  estimatedValue: number;
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number;
  valuationDate: string;
  method: 'automated' | 'comparables' | 'hybrid';
  pricePerSqm: number;
  valueRange: {
    low: number;
    high: number;
  };
  factors: ValuationFactor[];
  comparables: ComparableSale[];
  trends: ValueTrend[];
}

export interface ValuationFactor {
  name: string;
  impact: number; // percentage, positive or negative
  description: string;
}

export interface ComparableSale {
  id: string;
  address: string;
  salePrice: number;
  saleDate: string;
  bedrooms: number;
  bathrooms: number;
  size: number; // sqm
  pricePerSqm: number;
  distance: number; // km from subject property
  similarity: number; // 0-100 score
  source: 'lightstone' | 'windeed' | 'internal';
}

export interface ValueTrend {
  date: string;
  value: number;
  change: number; // percentage change from previous
}

export interface NeighborhoodFactor {
  id: string;
  name: string;
  category: 'location' | 'amenities' | 'schools' | 'transport' | 'safety' | 'market';
  score: number; // 1-10
  weight: number; // importance in valuation
  impact: number; // calculated impact on value
}

export interface AVMCalculationInput {
  propertyId?: string;
  address: string;
  suburb: string;
  city: string;
  propertyType: 'house' | 'apartment' | 'townhouse' | 'flat' | 'cottage';
  bedrooms: number;
  bathrooms: number;
  size: number; // sqm
  yearBuilt?: number;
  features?: string[];
  parkingSpaces?: number;
  pool?: boolean;
  garden?: boolean;
}

// Base prices per sqm by property type and city (simulating market data)
const BASE_PRICES: Record<string, Record<string, number>> = {
  house: {
    'Johannesburg': 12000,
    'Cape Town': 15000,
    'Durban': 11000,
    'Pretoria': 11000,
    'Port Elizabeth': 9500,
    'Bloemfontein': 8500,
  },
  apartment: {
    'Johannesburg': 10000,
    'Cape Town': 13000,
    'Durban': 9000,
    'Pretoria': 9500,
    'Port Elizabeth': 8000,
    'Bloemfontein': 7500,
  },
  townhouse: {
    'Johannesburg': 10500,
    'Cape Town': 12500,
    'Durban': 9500,
    'Pretoria': 10000,
    'Port Elizabeth': 8500,
    'Bloemfontein': 8000,
  },
  flat: {
    'Johannesburg': 8500,
    'Cape Town': 11000,
    'Durban': 7500,
    'Pretoria': 8000,
    'Port Elizabeth': 7000,
    'Bloemfontein': 6500,
  },
  cottage: {
    'Johannesburg': 9000,
    'Cape Town': 11500,
    'Durban': 8000,
    'Pretoria': 8500,
    'Port Elizabeth': 7500,
    'Bloemfontein': 7000,
  },
};

// Property type multipliers
const PROPERTY_TYPE_MULTIPLIERS: Record<string, number> = {
  house: 1.0,
  townhouse: 0.92,
  apartment: 0.85,
  flat: 0.75,
  cottage: 0.88,
};

// Bedroom value add (base amount per additional bedroom beyond 2)
const BEDROOM_VALUE_ADD: Record<string, number> = {
  'Johannesburg': 150000,
  'Cape Town': 200000,
  'Durban': 120000,
  'Pretoria': 130000,
  'Port Elizabeth': 100000,
  'Bloemfontein': 80000,
};

// Bathroom premium per bathroom
const BATHROOM_PREMIUM = 80000;

// Size adjustment factors
function calculateSizeFactor(size: number, propertyType: string): number {
  const optimalSizes: Record<string, { min: number; max: number }> = {
    house: { min: 150, max: 400 },
    apartment: { min: 50, max: 150 },
    townhouse: { min: 100, max: 200 },
    flat: { min: 40, max: 100 },
    cottage: { min: 80, max: 150 },
  };
  
  const optimal = optimalSizes[propertyType] || { min: 100, max: 200 };
  
  if (size >= optimal.min && size <= optimal.max) {
    return 1.0;
  }
  
  if (size < optimal.min) {
    // Smaller than optimal - penalize
    const deficit = optimal.min - size;
    return Math.max(0.7, 1 - (deficit / optimal.min) * 0.3);
  }
  
  // Larger than optimal - slight premium but diminishing
  const excess = size - optimal.max;
  return Math.min(1.15, 1 + (excess / optimal.max) * 0.1);
}

// Year built depreciation/appreciation
function calculateAgeFactor(yearBuilt?: number): number {
  if (!yearBuilt) return 0.95; // Unknown age
  
  const currentYear = new Date().getFullYear();
  const age = currentYear - yearBuilt;
  
  if (age <= 5) return 1.1; // New property premium
  if (age <= 10) return 1.05;
  if (age <= 20) return 1.0;
  if (age <= 30) return 0.92;
  if (age <= 50) return 0.85;
  return 0.75; // Older properties
}

// Feature adjustments
function calculateFeatureAdjustments(features?: string[], pool?: boolean, garden?: boolean, parkingSpaces?: number): number {
  let adjustment = 1.0;
  
  if (pool) adjustment += 0.08;
  if (garden) adjustment += 0.03;
  if (parkingSpaces && parkingSpaces >= 2) adjustment += 0.04;
  
  const featurePremium: Record<string, number> = {
    'pool': 0.08,
    'garden': 0.03,
    'garage': 0.04,
    'furnished': 0.05,
    'renovated': 0.06,
    'modern': 0.05,
    'balcony': 0.02,
    'scenic view': 0.04,
    'waterfront': 0.10,
  };
  
  features?.forEach(feature => {
    const key = feature.toLowerCase();
    for (const [keyword, premium] of Object.entries(featurePremium)) {
      if (key.includes(keyword)) {
        adjustment += premium;
        break;
      }
    }
  });
  
  return adjustment;
}

// Calculate confidence score based on data availability
function calculateConfidence(input: AVMCalculationInput): { level: 'high' | 'medium' | 'low'; score: number } {
  let score = 50;
  
  if (input.yearBuilt) score += 15;
  if (input.features && input.features.length > 0) score += 10;
  if (input.size > 0) score += 15;
  if (input.propertyType) score += 10;
  
  if (score >= 80) return { level: 'high', score };
  if (score >= 60) return { level: 'medium', score };
  return { level: 'low', score };
}

// Main AVM calculation function
export function calculateAVM(input: AVMCalculationInput): PropertyValuation {
  const city = input.city || 'Johannesburg';
  const basePrice = BASE_PRICES[input.propertyType]?.[city] || BASE_PRICES.house.Johannesburg;
  
  // Calculate base value
  const typeMultiplier = PROPERTY_TYPE_MULTIPLIERS[input.propertyType] || 1.0;
  const sizeFactor = calculateSizeFactor(input.size, input.propertyType);
  const ageFactor = calculateAgeFactor(input.yearBuilt);
  const featureAdjustment = calculateFeatureAdjustments(input.features, input.pool, input.garden, input.parkingSpaces);
  
  // Calculate bedroom adjustments (starting from 2 beds)
  const bedroomDiff = Math.max(0, input.bedrooms - 2);
  const bedroomValue = bedroomDiff * (BEDROOM_VALUE_ADD[city] || 150000);
  
  // Calculate bathroom adjustment
  const bathroomPremium = (input.bathrooms - 1) * BATHROOM_PREMIUM;
  
  // Final calculation
  const baseValue = input.size * basePrice * typeMultiplier * sizeFactor * ageFactor * featureAdjustment;
  const estimatedValue = Math.round(baseValue + bedroomValue + bathroomPremium);
  
  // Value range (±10-15% based on confidence)
  const confidence = calculateConfidence(input);
  const rangePercent = confidence.level === 'high' ? 0.10 : confidence.level === 'medium' ? 0.12 : 0.15;
  const valueRange = {
    low: Math.round(estimatedValue * (1 - rangePercent)),
    high: Math.round(estimatedValue * (1 + rangePercent)),
  };
  
  // Price per sqm
  const pricePerSqm = Math.round(estimatedValue / input.size);
  
  // Generate valuation factors
  const factors: ValuationFactor[] = [
    {
      name: 'Property Type',
      impact: (typeMultiplier - 1) * 100,
      description: `${input.propertyType} type properties in ${city}`,
    },
    {
      name: 'Size',
      impact: (sizeFactor - 1) * 100,
      description: `${input.size} sqm compared to typical for ${input.propertyType}`,
    },
    {
      name: 'Age',
      impact: (ageFactor - 1) * 100,
      description: input.yearBuilt ? `Built in ${input.yearBuilt}` : 'Age unknown',
    },
    {
      name: 'Features',
      impact: (featureAdjustment - 1) * 100,
      description: 'Additional features premium',
    },
  ];
  
  // Generate mock comparables
  const comparables = generateComparables(input, estimatedValue, city);
  
  // Generate value trends
  const trends = generateTrends(estimatedValue);
  
  return {
    id: `val_${Date.now()}`,
    propertyId: input.propertyId || '',
    propertyAddress: `${input.address}, ${input.suburb}, ${input.city}`,
    estimatedValue,
    confidence: confidence.level,
    confidenceScore: confidence.score,
    valuationDate: new Date().toISOString(),
    method: 'automated',
    pricePerSqm,
    valueRange,
    factors,
    comparables,
    trends,
  };
}

// Generate mock comparable sales
function generateComparables(input: AVMCalculationInput, estimatedValue: number, city: string): ComparableSale[] {
  const comparables: ComparableSale[] = [];
  const count = 5;
  
  for (let i = 0; i < count; i++) {
    const variance = (Math.random() - 0.5) * 0.2; // ±10%
    const salePrice = Math.round(estimatedValue * (1 + variance));
    const size = input.size + Math.round((Math.random() - 0.5) * 50);
    const pricePerSqm = Math.round(salePrice / size);
    const monthsAgo = Math.floor(Math.random() * 12) + 1;
    const saleDate = new Date();
    saleDate.setMonth(saleDate.getMonth() - monthsAgo);
    
    comparables.push({
      id: `comp_${i}`,
      address: `${100 + i * 10} ${['Oak', 'Maple', 'Pine', 'Cedar', 'Willow'][i]} Street, ${input.suburb}`,
      salePrice,
      saleDate: saleDate.toISOString(),
      bedrooms: input.bedrooms + Math.floor(Math.random() * 2) - 1,
      bathrooms: input.bathrooms + Math.floor(Math.random() * 2) - 1,
      size,
      pricePerSqm,
      distance: Math.round((Math.random() * 3 + 0.5) * 10) / 10,
      similarity: Math.round(70 + Math.random() * 25),
      source: ['lightstone', 'windeed', 'internal'][Math.floor(Math.random() * 3)] as any,
    });
  }
  
  // Sort by similarity
  return comparables.sort((a, b) => b.similarity - a.similarity);
}

// Generate historical value trends
function generateTrends(currentValue: number): ValueTrend[] {
  const trends: ValueTrend[] = [];
  let value = currentValue * 0.85; // Start 15% lower
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    const monthlyChange = (Math.random() - 0.3) * 0.02; // Slight upward bias
    value = value * (1 + monthlyChange);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value),
      change: Math.round(monthlyChange * 1000) / 10,
    });
  }
  
  return trends;
}

// Calculate price per square meter
export function calculatePricePerSqm(price: number, size: number): number {
  if (size <= 0) return 0;
  return Math.round(price / size);
}

// Analyze neighborhood factors
export function analyzeNeighborhood(suburb: string): NeighborhoodFactor[] {
  // Simulated neighborhood data - in production, this would come from Lightstone/Windeed
  const factors: NeighborhoodFactor[] = [
    {
      id: 'schools',
      name: 'School Quality',
      category: 'schools',
      score: 7 + Math.random() * 3,
      weight: 0.15,
      impact: 0,
    },
    {
      id: 'transport',
      name: 'Transport Access',
      category: 'transport',
      score: 6 + Math.random() * 4,
      weight: 0.1,
      impact: 0,
    },
    {
      id: 'safety',
      name: 'Safety Index',
      category: 'safety',
      score: 5 + Math.random() * 5,
      weight: 0.2,
      impact: 0,
    },
    {
      id: 'amenities',
      name: 'Amenities',
      category: 'amenities',
      score: 6 + Math.random() * 4,
      weight: 0.1,
      impact: 0,
    },
    {
      id: 'market',
      name: 'Market Activity',
      category: 'market',
      score: 6 + Math.random() * 4,
      weight: 0.25,
      impact: 0,
    },
    {
      id: 'location',
      name: 'Location Premium',
      category: 'location',
      score: 6 + Math.random() * 4,
      weight: 0.2,
      impact: 0,
    },
  ];
  
  // Calculate impact based on scores
  const avgScore = factors.reduce((sum, f) => sum + f.score, 0) / factors.length;
  factors.forEach(factor => {
    factor.impact = ((factor.score - avgScore) / 10) * factor.weight * 20;
  });
  
  return factors;
}

// Generate a comparative market analysis
export function generateCMASubject(
  input: AVMCalculationInput,
  avm: PropertyValuation
): {
  summary: string;
  recommendations: string[];
  marketConditions: string;
} {
  const city = input.city || 'Johannesburg';
  const pricePerSqm = avm.pricePerSqm;
  
  // Determine market conditions based on recent trends
  const avgTrendChange = avm.trends.reduce((sum, t) => sum + t.change, 0) / avm.trends.length;
  let marketConditions: string;
  if (avgTrendChange > 1) {
    marketConditions = 'Seller\'s Market - Rising prices, high demand';
  } else if (avgTrendChange < -1) {
    marketConditions = 'Buyer\'s Market - Falling prices, good inventory';
  } else {
    marketConditions = 'Balanced Market - Stable prices';
  }
  
  // Generate summary
  const summary = `Based on automated valuation analysis, the estimated market value for the property at ${input.address}, ${input.suburb} is between ${formatCurrency(avm.valueRange.low)} and ${formatCurrency(avm.valueRange.high)}. The valuation is based on comparable sales data from ${avm.comparables.length} similar properties in the area, with a confidence score of ${avm.confidenceScore}%. Current price per sqm is ${formatCurrency(pricePerSqm)}.`;
  
  // Recommendations
  const recommendations: string[] = [];
  
  if (avm.confidence === 'low') {
    recommendations.push('Consider getting a professional appraisal for more accurate valuation');
  }
  
  if (pricePerSqm > (BASE_PRICES[input.propertyType]?.[city] || 10000) * 1.2) {
    recommendations.push('Property is priced at premium - verify with comparables');
  }
  
  if (avm.comparables.some(c => c.similarity > 90)) {
    recommendations.push('Strong comparable sales available - high confidence in valuation');
  }
  
  if (avgTrendChange > 0.5) {
    recommendations.push('Market showing upward trend - good time to list');
  }
  
  recommendations.push('Review comparable sales in the last 6 months for best accuracy');
  recommendations.push('Consider staging and marketing to achieve estimated value');
  
  return {
    summary,
    recommendations,
    marketConditions,
  };
}

// Helper to format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(value);
}

// Calculate rental yield estimate
export function calculateRentalYield(
  propertyValue: number,
  monthlyRent: number
): {
  grossYield: number;
  netYield: number;
  annualRent: number;
  annualExpense: number;
} {
  const annualRent = monthlyRent * 12;
  const grossYield = (annualRent / propertyValue) * 100;
  
  // Estimate annual expenses (taxes, maintenance, insurance, etc.)
  const annualExpense = propertyValue * 0.025; // ~2.5% of property value
  const netYield = ((annualRent - annualExpense) / propertyValue) * 100;
  
  return {
    grossYield: Math.round(grossYield * 100) / 100,
    netYield: Math.round(netYield * 100) / 100,
    annualRent,
    annualExpense,
  };
}

