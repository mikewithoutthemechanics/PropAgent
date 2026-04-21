import { NextResponse } from 'next/server';
import { aiLimiter, cacheGet, cacheSet, checkLimit } from '@/lib/redis';
import { chatJSON } from '@/lib/openai-server';

export const runtime = 'nodejs';

type Body = {
  suburb?: string;
  province?: string;
  propertyType?: string;
};

type Result = {
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
  cached: boolean;
};

const TTL_SECONDS = 60 * 60 * 24;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body.suburb) {
    return NextResponse.json({ error: 'suburb_required' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  const limit = await checkLimit(aiLimiter, `ai:property-analytics:${ip}`);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'rate_limited', reset: limit.reset },
      { status: 429 },
    );
  }

  const province = body.province ?? 'Gauteng';
  const propertyType = body.propertyType ?? 'residential';

  const key = `agent-loop:analytics:${body.suburb.toLowerCase().trim()}|${province.toLowerCase().trim()}|${propertyType.toLowerCase()}`;
  const cached = await cacheGet<Result>(key);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  const prompt = `You are a South African residential property market analyst. For the suburb below, give realistic ZAR market stats and 3-5 short plain-English insights for a property manager. Use current-ish SA norms: median prices R800,000 – R12,000,000 depending on suburb, rental yields 5-10%, vacancy 2-12%, days on market 20-120.

Respond with ONLY a JSON object:
{
  "medianPrice": number,
  "priceChange12m": number (percent, can be negative),
  "avgDaysOnMarket": number,
  "inventoryLevel": "low" | "medium" | "high",
  "demandLevel": "low" | "medium" | "high",
  "recommendedPrice": number,
  "priceRangeLow": number,
  "priceRangeHigh": number,
  "rentalYield": number (gross %, 1 decimal),
  "vacancyRate": number (%),
  "insights": ["bullet 1", "bullet 2", ...],
  "summary": "1-2 sentence tl;dr for this suburb"
}

Suburb: ${body.suburb}
Province: ${province}
Property type: ${propertyType}`;

  const parsed = await chatJSON<Omit<Result, 'cached' | 'suburb' | 'province'>>(
    [{ role: 'user', content: prompt }],
    { temperature: 0.3 },
  );

  if (!parsed || typeof parsed.medianPrice !== 'number') {
    return NextResponse.json({
      error: 'ai_unavailable',
      message:
        'AI analytics unavailable. Set GROQ_API_KEY to enable suburb insights.',
    }, { status: 503 });
  }

  const result: Result = {
    suburb: body.suburb,
    province,
    medianPrice: Math.round(parsed.medianPrice),
    priceChange12m: Number(parsed.priceChange12m) || 0,
    avgDaysOnMarket: Math.round(Number(parsed.avgDaysOnMarket) || 0),
    inventoryLevel: parsed.inventoryLevel ?? 'medium',
    demandLevel: parsed.demandLevel ?? 'medium',
    recommendedPrice: Math.round(parsed.recommendedPrice || parsed.medianPrice),
    priceRangeLow: Math.round(
      parsed.priceRangeLow || parsed.medianPrice * 0.85,
    ),
    priceRangeHigh: Math.round(
      parsed.priceRangeHigh || parsed.medianPrice * 1.15,
    ),
    rentalYield: Number(parsed.rentalYield) || 6,
    vacancyRate: Number(parsed.vacancyRate) || 5,
    insights: Array.isArray(parsed.insights) ? parsed.insights.slice(0, 8) : [],
    summary: parsed.summary ?? '',
    cached: false,
  };

  await cacheSet(key, result, TTL_SECONDS);
  return NextResponse.json(result);
}
