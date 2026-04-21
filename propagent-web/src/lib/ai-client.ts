// Client helpers for the AI endpoints.

export type AIChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function aiChat(messages: AIChatMessage[], systemPrompt?: string): Promise<string> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt }),
    });
    if (res.status === 429) {
      return "You're sending messages too fast — give it a few seconds and try again.";
    }
    if (!res.ok) {
      return "I couldn't reach the AI service. Please try again in a moment.";
    }
    const data = (await res.json()) as { reply?: string };
    return data.reply ?? '';
  } catch (err) {
    console.warn('[ai-client] chat threw', err);
    return "I couldn't reach the AI service. Please try again in a moment.";
  }
}

export type AIError = { error: string; message?: string };

async function postJSON<TReq, TRes>(
  path: string,
  body: TReq,
): Promise<{ data: TRes } | { error: AIError }> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as
      | TRes
      | AIError
      | null;
    if (!res.ok) {
      const err = (json as AIError) || { error: 'request_failed' };
      return { error: err };
    }
    return { data: json as TRes };
  } catch (err) {
    console.warn(`[ai-client] ${path} threw`, err);
    return { error: { error: 'network_error', message: String(err) } };
  }
}

// ----- Valuation -----

export type AIValuationInput = {
  address: string;
  suburb: string;
  city?: string;
  province?: string;
  bedrooms?: number;
  bathrooms?: number;
  garages?: number;
  erfSize?: number;
  floorSize?: number;
};

export type AIValuationResult = {
  estimatedValue: number;
  lowerBound: number;
  upperBound: number;
  rationale: string;
  cached?: boolean;
};

export function aiValuation(input: AIValuationInput) {
  return postJSON<AIValuationInput, AIValuationResult>('/api/ai/valuation', input);
}

// ----- Market comparison -----

export type AIMarketComparisonInput = {
  address?: string;
  suburb?: string;
  city?: string;
  province?: string;
  listingType?: 'sale' | 'rent';
  bedrooms?: number;
  bathrooms?: number;
  floorSize?: number;
};

export type AIComparable = {
  id: string;
  address: string;
  suburb: string;
  price: number;
  beds: number;
  baths: number;
  garages: number;
  floorSize: number;
  pricePerSqm: number;
  daysOnMarket: number;
  listingType: 'sale' | 'rent';
  similarity: number;
};

export type AIMarketComparisonResult = {
  comparables: AIComparable[];
  summary: string;
  medianPrice: number;
  averageDaysOnMarket: number;
  cached?: boolean;
};

export function aiMarketComparison(input: AIMarketComparisonInput) {
  return postJSON<AIMarketComparisonInput, AIMarketComparisonResult>(
    '/api/ai/market-comparison',
    input,
  );
}

// ----- Tenant screening -----

export type AITenantScreeningInput = {
  name?: string;
  monthlyIncome: number;
  monthlyRent: number;
  creditScore?: number;
  employmentStatus?: string;
  employerTenureMonths?: number;
  hasPets?: boolean;
  petDetails?: string;
  references?: Array<{ landlord: string; response: 'good' | 'bad' | 'pending' | 'no_response' }>;
  prevEvictions?: number;
  notes?: string;
};

export type AITenantScreeningResult = {
  recommendation: 'approve' | 'conditional' | 'decline';
  score: number;
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warning' | 'pending';
    details: string;
  }>;
  riskFactors: string[];
  strengths: string[];
  narrative: string;
};

export function aiTenantScreening(input: AITenantScreeningInput) {
  return postJSON<AITenantScreeningInput, AITenantScreeningResult>(
    '/api/ai/tenant-screening',
    input,
  );
}

// ----- Property analytics -----

export type AIPropertyAnalyticsInput = {
  suburb: string;
  province?: string;
  propertyType?: string;
};

export type AIPropertyAnalyticsResult = {
  suburb: string;
  province: string;
  medianPrice: number;
  priceChange12m: number;
  avgDaysOnMarket: number;
  inventoryLevel: 'low' | 'medium' | 'high';
  demandLevel: 'low' | 'medium' | 'high';
  recommendedPrice: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  rentalYield: number;
  vacancyRate: number;
  insights: string[];
  summary: string;
  cached?: boolean;
};

export function aiPropertyAnalytics(input: AIPropertyAnalyticsInput) {
  return postJSON<AIPropertyAnalyticsInput, AIPropertyAnalyticsResult>(
    '/api/ai/property-analytics',
    input,
  );
}

// ----- Maintenance classification -----

export type AIMaintenanceInput = {
  issue: string;
  property?: string;
  reportedBy?: string;
};

export type AIMaintenanceResult = {
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'pest' | 'other';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedCost: number;
  estimatedCostRange: { low: number; high: number };
  rationale: string;
  recommendedVendor: string;
  suggestedSlaHours: number;
};

export function aiMaintenanceClassify(input: AIMaintenanceInput) {
  return postJSON<AIMaintenanceInput, AIMaintenanceResult>(
    '/api/ai/maintenance-classify',
    input,
  );
}

// ----- Listing copy -----

export type AIListingInput = {
  address?: string;
  suburb?: string;
  city?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  erfSize?: number;
  floorArea?: number;
  price?: number;
  features?: string[];
  isForSale?: boolean;
  tone?: 'luxury' | 'family' | 'investor' | 'student' | 'professional';
};

export type AIListingResult = {
  title: string;
  headlines: string[];
  description: string;
  bullets: string[];
  hashtags: string[];
};

export function aiListing(input: AIListingInput) {
  return postJSON<AIListingInput, AIListingResult>('/api/ai/listing', input);
}

// ----- Document drafting -----

export type AIDocumentInput = {
  templateName: string;
  category?: string;
  fields?: Record<string, string | number>;
  notes?: string;
};

export type AIDocumentResult = {
  body: string;
};

export function aiDocument(input: AIDocumentInput) {
  return postJSON<AIDocumentInput, AIDocumentResult>('/api/ai/document', input);
}
