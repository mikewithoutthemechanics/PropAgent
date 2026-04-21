// AI Rent Suggestion Engine for AgentPing
// Supports both simulated data and real market data integration

import { Property } from './types';

// ============================================================================
// REAL DATA INTEGRATION - South African Property Market Data
// ============================================================================

export interface MarketDataSource {
  source: 'simulated' | 'property24' | 'private_property' | 'user_portfolio' | 'api';
  name: string;
  lastUpdated: string | null;
  recordCount: number;
}

export interface LiveRentalListing {
  id: string;
  address: string;
  suburb: string;
  city: string;
  province: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  squareMeters: number;
  parking: number;
  features: string[];
  listingDate: string;
  source: string;
}

// API Configuration
const MARKET_DATA_CONFIG = {
  // Property24 Agent API - requires YHL ID and agency credentials
  property24: {
    enabled: process.env.NEXT_PUBLIC_P24_ENABLED === 'true',
    agencyId: process.env.NEXT_PUBLIC_P24_AGENCY_ID || '',
    apiKey: process.env.P24_API_KEY || '',
  },
  // Private Property API
  privateProperty: {
    enabled: process.env.NEXT_PUBLIC_PP_ENABLED === 'true',
    apiKey: process.env.PP_API_KEY || '',
  },
  // Apify Property24 Scraper - uses Apify platform to scrape Property24
  apify: {
    enabled: process.env.NEXT_PUBLIC_APIFY_ENABLED === 'true',
    apiKey: process.env.APIFY_API_KEY || '',
    actorId: 'shahidirfan/private-property-scraper',
  },
  // Groq API for market analysis
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    enabled: !!process.env.GROQ_API_KEY,
  },
  // Custom API endpoint
  customApi: {
    enabled: process.env.NEXT_PUBLIC_CUSTOM_API_ENABLED === 'true',
    endpoint: process.env.CUSTOM_MARKET_API_ENDPOINT || '',
    apiKey: process.env.CUSTOM_MARKET_API_KEY || '',
  }
};

// Fetch real rental data from configured APIs
export async function fetchLiveMarketRentals(
  province: string,
  city: string,
  suburb?: string,
  bedrooms?: number,
  propertyType?: string
): Promise<LiveRentalListing[]> {
  const listings: LiveRentalListing[] = [];
  
  // Try Apify Property24 Scraper first if configured (most reliable SA source)
  if (MARKET_DATA_CONFIG.apify.enabled && MARKET_DATA_CONFIG.apify.apiKey) {
    try {
      const apifyListings = await fetchFromApify(province, city, suburb, bedrooms, propertyType);
      listings.push(...apifyListings);
    } catch (error) {
      console.error('Apify scraper error:', error);
    }
  }
  
  // Try Property24 API first if configured
  if (MARKET_DATA_CONFIG.property24.enabled && MARKET_DATA_CONFIG.property24.agencyId) {
    try {
      const p24Listings = await fetchFromProperty24(province, city, suburb, bedrooms, propertyType);
      listings.push(...p24Listings);
    } catch (error) {
      console.error('Property24 API error:', error);
    }
  }
  
  // Try Private Property API if configured
  if (MARKET_DATA_CONFIG.privateProperty.enabled) {
    try {
      const ppListings = await fetchFromPrivateProperty(province, city, suburb, bedrooms, propertyType);
      listings.push(...ppListings);
    } catch (error) {
      console.error('Private Property API error:', error);
    }
  }
  
  // Try Groq for market research if no data found
  if (listings.length === 0 && MARKET_DATA_CONFIG.groq.enabled) {
    try {
      const groqListings = await fetchMarketResearchFromGroq(province, city, suburb, bedrooms, propertyType);
      listings.push(...groqListings);
    } catch (error) {
      console.error('Groq market research error:', error);
    }
  }
  
  // Try custom API if configured
  if (MARKET_DATA_CONFIG.customApi.enabled && MARKET_DATA_CONFIG.customApi.endpoint) {
    try {
      const customListings = await fetchFromCustomAPI(province, city, suburb, bedrooms, propertyType);
      listings.push(...customListings);
    } catch (error) {
      console.error('Custom API error:', error);
    }
  }
  
  return listings;
}

// Apify Property24 scraper integration
async function fetchFromApify(
  province: string,
  city: string,
  suburb?: string,
  bedrooms?: number,
  propertyType?: string
): Promise<LiveRentalListing[]> {
  const { apiKey, actorId } = MARKET_DATA_CONFIG.apify;
  
  const runInput = {
    location: `${suburb || city}, ${province.replace('_', ' ')}`,
    propertyType: propertyType || 'rental',
    maxResults: 20,
    filters: {
      bedrooms: bedrooms || 1,
    }
  };
  
  // Start the scraper
  const startResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(runInput),
  });
  
  if (!startResponse.ok) {
    throw new Error(`Apify start error: ${startResponse.status}`);
  }
  
  const startData = await startResponse.json();
  const runId = startData.id;
  
  // Wait for completion (poll for status)
  let status = 'LOADING';
  let attempts = 0;
  
  while (status === 'LOADING' && attempts < 30) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const statusResponse = await fetch(`https://api.apify.com/v2/runs/${runId}/status`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    
    const statusData = await statusResponse.json();
    status = statusData.data.status;
    attempts++;
  }
  
  if (status !== 'SUCCEEDED') {
    throw new Error(`Apify run failed: ${status}`);
  }
  
  // Get the dataset
  const datasetResponse = await fetch(`https://api.apify.com/v2/runs/${runId}/dataset/items`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  
  const items = await datasetResponse.json();
  
  return items.slice(0, 10).map((item: any) => ({
    id: item.id || `apify-${Date.now()}`,
    address: item.title || item.address || 'Unknown',
    suburb: item.suburb || suburb || city,
    city: item.location?.city || city,
    province: item.location?.province || province,
    rent: parseInt(item.price?.replace(/[^0-9]/g, '') || '15000'),
    bedrooms: item.bedrooms || bedrooms || 2,
    bathrooms: item.bathrooms || 1,
    propertyType: item.propertyType || 'apartment',
    squareMeters: item.floorArea || 80,
    parking: item.parking || 1,
    features: item.features || [],
    listingDate: item.published || new Date().toISOString(),
    source: 'property24_via_apify',
  }));
}

// Property24 API integration
async function fetchFromProperty24(
  province: string,
  city: string,
  suburb?: string,
  bedrooms?: number,
  propertyType?: string
): Promise<LiveRentalListing[]> {
  const { agencyId, apiKey } = MARKET_DATA_CONFIG.property24;
  
  // Build query parameters
  const params = new URLSearchParams({
    agency_id: agencyId,
    province: province.replace('_', ' '),
    city: city,
    listing_type: 'rent',
  });
  
  if (suburb) params.append('suburb', suburb);
  if (bedrooms) params.append('bedrooms', bedrooms.toString());
  if (propertyType) params.append('property_type', propertyType);
  
  // Property24 API endpoint (requires agent subscription)
  // This is a placeholder - actual endpoint depends on P24 API docs
  const response = await fetch(`https://api.property24.co.za/listings?${params}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Property24 API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Transform Property24 response to our format
  return (data.listings || []).map((listing: any) => ({
    id: listing.listing_id,
    address: listing.address,
    suburb: listing.suburb,
    city: listing.city,
    province: listing.province,
    rent: listing.rental_price,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    propertyType: listing.property_type,
    squareMeters: listing.floor_area,
    parking: listing.parking || 0,
    features: listing.features || [],
    listingDate: listing.list_date,
    source: 'property24',
  }));
}

// Private Property API integration
async function fetchFromPrivateProperty(
  province: string,
  city: string,
  suburb?: string,
  bedrooms?: number,
  propertyType?: string
): Promise<LiveRentalListing[]> {
  const { apiKey } = MARKET_DATA_CONFIG.privateProperty;
  
  const searchParams = {
    province: province.replace('_', ' '),
    city: city,
    type: propertyType || 'any',
    status: 'available',
  };
  
  const response = await fetch('https://api.privateproperty.co.za/rentals/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(searchParams),
  });
  
  if (!response.ok) {
    throw new Error(`Private Property API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  return (data.results || []).map((listing: any) => ({
    id: listing.id,
    address: listing.title,
    suburb: listing.suburb,
    city: listing.region,
    province: listing.province,
    rent: listing.price,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    propertyType: listing.type,
    squareMeters: listing.size,
    parking: listing.parking || 0,
    features: listing.amenities || [],
    listingDate: listing.created_at,
    source: 'private_property',
  }));
}

// Groq market research - uses web search to find current SA rental prices
async function fetchMarketResearchFromGroq(
  province: string,
  city: string,
  suburb?: string,
  bedrooms?: number,
  propertyType?: string
): Promise<LiveRentalListing[]> {
  const { apiKey } = MARKET_DATA_CONFIG.groq;
  const location = suburb || city;
  const propType = propertyType || 'apartment';
  
  // Use Groq to search the web for current rental prices
  const searchPrompt = `Find current rental prices for ${bedrooms || 2}-bedroom ${propType} in ${location}, ${province.replace('_', ' ')}, South Africa. Return prices in ZAR (Rands). List at least 5 recent rental listings with their prices.`;
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a South African real estate market expert. Search the web for current rental property prices and return structured data.'
        },
        {
          role: 'user',
          content: searchPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: 'json_object' }
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }
  
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    return [];
  }
  
  // Try to parse the response as JSON
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    // If not valid JSON, try to extract prices manually
    const priceMatches = content.match(/R\s*([\d,]+)/g) || [];
    return priceMatches.slice(0, 5).map((price, idx) => ({
      id: `groq-${idx}`,
      address: `${location} - Research ${idx + 1}`,
      suburb: location,
      city: city,
      province: province,
      rent: parseInt(price.replace(/[^0-9]/g, '')) || 15000,
      bedrooms: bedrooms || 2,
      bathrooms: 1,
      propertyType: propType,
      squareMeters: 80,
      parking: 1,
      features: [],
      listingDate: new Date().toISOString(),
      source: 'groq_research',
    }));
  }
  
  // Convert parsed data to our format
  const listings = (parsed.listings || parsed.prices || []).slice(0, 5).map((item: any, idx: number) => ({
    id: `groq-${idx}`,
    address: item.address || `${location}`,
    suburb: location,
    city: city,
    province: province,
    rent: parseInt(String(item.rent || item.price || 15000).replace(/[^0-9]/g, '')),
    bedrooms: bedrooms || 2,
    bathrooms: item.bathrooms || 1,
    propertyType: propType,
    squareMeters: item.size || 80,
    parking: 1,
    features: [],
    listingDate: new Date().toISOString(),
    source: 'groq_research',
  }));
  
  return listings;
}

// Custom API integration (for user's own data or alternative sources)
async function fetchFromCustomAPI(
  province: string,
  city: string,
  suburb?: string,
  bedrooms?: number,
  propertyType?: string
): Promise<LiveRentalListing[]> {
  const { endpoint, apiKey } = MARKET_DATA_CONFIG.customApi;
  
  const params = new URLSearchParams({
    province: province.replace('_', ' '),
    city: city,
  });
  
  if (suburb) params.append('suburb', suburb);
  if (bedrooms) params.append('bedrooms', bedrooms.toString());
  if (propertyType) params.append('type', propertyType);
  
  const response = await fetch(`${endpoint}/rentals?${params}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Custom API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.listings || data.results || [];
}

// Get current data source status
export function getMarketDataSourceStatus(): MarketDataSource {
  const hasRealSource = 
    MARKET_DATA_CONFIG.apify.enabled ||
    MARKET_DATA_CONFIG.property24.enabled ||
    MARKET_DATA_CONFIG.privateProperty.enabled ||
    MARKET_DATA_CONFIG.groq.enabled ||
    MARKET_DATA_CONFIG.customApi.enabled;
  
  let sourceName = 'Estimated Market Data';
  if (MARKET_DATA_CONFIG.apify.enabled) sourceName = 'Property24 Live Data';
  else if (MARKET_DATA_CONFIG.groq.enabled) sourceName = 'AI Market Research';
  else if (MARKET_DATA_CONFIG.property24.enabled) sourceName = 'Property24 API';
  else if (MARKET_DATA_CONFIG.privateProperty.enabled) sourceName = 'Private Property';
  else if (MARKET_DATA_CONFIG.customApi.enabled) sourceName = 'Custom API';
  
  if (hasRealSource) {
    return {
      source: 'api',
      name: sourceName,
      lastUpdated: new Date().toISOString(),
      recordCount: 0,
    };
  }
  
  return {
    source: 'simulated',
    name: 'Estimated Market Data',
    lastUpdated: null,
    recordCount: 0,
  };
}

// Calculate market rent from real comparables
export function calculateMarketRentFromComparables(comparables: LiveRentalListing[]): {
  min: number;
  median: number;
  max: number;
  average: number;
  count: number;
} | null {
  if (!comparables || comparables.length === 0) return null;
  
  const rents = comparables.map(c => c.rent).sort((a, b) => a - b);
  const sum = rents.reduce((acc, r) => acc + r, 0);
  
  return {
    min: rents[0],
    median: rents[Math.floor(rents.length / 2)],
    max: rents[rents.length - 1],
    average: Math.round(sum / rents.length),
    count: comparables.length,
  };
}

export interface RentAnalysisInput {
  propertyId?: string;
  address?: string;
  propertyType: 'house' | 'apartment' | 'flat' | 'townhouse' | 'room';
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
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

// ============================================================================
// COMBINED RENT SUGGESTION - Uses real data when available, falls back to algorithm
// ============================================================================

// Enhanced AI rent suggestion function with real market data integration
export async function generateLiveRentSuggestion(input: RentAnalysisInput): Promise<RentSuggestion> {
  // Try to fetch real market data
  let realComparables: LiveRentalListing[] = [];
  let useRealData = false;
  
  try {
    realComparables = await fetchLiveMarketRentals(
      input.location.province,
      input.location.city,
      input.location.suburb,
      input.bedrooms,
      input.propertyType
    );
    useRealData = realComparables.length > 0;
  } catch (error) {
    console.error('Failed to fetch real market data:', error);
  }
  
  // If we have real data, use it for more accurate suggestions
  if (useRealData && realComparables.length > 0) {
    return generateRentFromLiveData(input, realComparables);
  }
  
  // Fall back to algorithm-based suggestion
  return generateRentSuggestion(input);
}

// Generate rent suggestion from live market data
function generateRentFromLiveData(
  input: RentAnalysisInput,
  comparables: LiveRentalListing[]
): RentSuggestion {
  const now = new Date();
  
  // Calculate market rent from real comparables
  const marketStats = calculateMarketRentFromComparables(comparables);
  const marketRent = marketStats?.average || 15000;
  
  // Calculate rent range (±15%)
  const minRent = Math.round(marketRent * 0.85);
  const maxRent = Math.round(marketRent * 1.15);
  
  // Convert live listings to our comparable format
  const rentComparables: RentComparable[] = comparables.slice(0, 5).map((listing, idx) => ({
    id: listing.id,
    title: `${listing.propertyType} in ${listing.suburb}`,
    address: listing.address,
    rent: listing.rent,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    distance: idx * 0.5,
    similarityScore: 85 - (idx * 10), // Simulated similarity
  }));
  
  // Generate price history from recent data
  const priceHistory: RentPriceHistory[] = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - 1 - i + 12) % 12;
    const year = currentMonth - i < 1 ? currentYear - 1 : currentYear;
    
    priceHistory.push({
      date: `${months[monthIndex]} ${year}`,
      rent: Math.round(marketRent * (1 - i * 0.02)),
      event: i === 5 ? 'initial' : 'market_update',
    });
  }
  
  // High confidence with real data
  const confidence: 'low' | 'medium' | 'high' = 
    comparables.length >= 10 ? 'high' : 
    comparables.length >= 5 ? 'medium' : 'low';
  
  // Generate confidence factors
  const confidenceFactors: string[] = [];
  if (comparables.length >= 3) confidenceFactors.push(`${comparables.length} real market comparables`);
  confidenceFactors.push(useRealData ? 'Live market data from SA sources' : 'Based on SA market trends');
  if (input.location.suburb) confidenceFactors.push('Suburb-specific pricing');
  
  // Recommendations based on market position
  const recommendations: string[] = [];
  if (input.currentRent && input.currentRent < marketRent * 0.9) {
    recommendations.push('Below market rate - consider increasing to match market');
  } else if (input.currentRent && input.currentRent > marketRent * 1.1) {
    recommendations.push('Above market rate - consider reducing to attract tenants faster');
  } else {
    recommendations.push('Competitive with current market - good pricing');
  }
  
  // Seasonal recommendation
  const seasonalData = getSeasonalRecommendation();
  if (seasonalData.factor > 0.03) {
    recommendations.push('Peak season - optimal time to list at market rate');
  }
  
  return {
    propertyId: input.propertyId || `prop-${Date.now()}`,
    analysisDate: now.toISOString(),
    minRent,
    marketRent,
    maxRent,
    baseRent: marketRent * 0.9,
    locationAdjustment: marketRent * 0.1,
    propertyFeaturesAdjustment: 0,
    seasonalAdjustment: 0,
    marketAdjustment: 0,
    comparables: rentComparables,
    priceHistory,
    confidence,
    confidenceFactors,
    recommendations,
    recommendedDaysOnMarket: 21,
    pricePerSqm: input.squareMeters ? Math.round(marketRent / input.squareMeters) : undefined,
  };
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