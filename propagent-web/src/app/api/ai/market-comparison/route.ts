import { NextResponse } from 'next/server';
import { aiLimiter, cacheGet, cacheSet, checkLimit } from '@/lib/redis';
import { chatJSON } from '@/lib/openai-server';

export const runtime = 'nodejs';

type Body = {
  address?: string;
  suburb?: string;
  city?: string;
  province?: string;
  listingType?: 'sale' | 'rent';
  bedrooms?: number;
  bathrooms?: number;
  floorSize?: number;
};

type Comparable = {
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

type Result = {
  comparables: Comparable[];
  summary: string;
  medianPrice: number;
  averageDaysOnMarket: number;
  cached: boolean;
};

const TTL_SECONDS = 60 * 60 * 12;

function cacheKey(b: Body): string {
  return `agent-loop:market-comparison:${[
    (b.address ?? '').toLowerCase().trim(),
    (b.suburb ?? '').toLowerCase().trim(),
    (b.city ?? '').toLowerCase().trim(),
    b.listingType ?? 'sale',
    String(b.bedrooms ?? ''),
    String(b.bathrooms ?? ''),
    String(b.floorSize ?? ''),
  ].join('|')}`;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body.address && !body.suburb) {
    return NextResponse.json({ error: 'address_or_suburb_required' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  const limit = await checkLimit(aiLimiter, `ai:market-comparison:${ip}`);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'rate_limited', reset: limit.reset },
      { status: 429 },
    );
  }

  const key = cacheKey(body);
  const cached = await cacheGet<Result>(key);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  const listingType = body.listingType ?? 'sale';
  const prompt = `You are a South African real estate comparables engine. Given the subject property below, produce 5 plausible recently sold/listed comparable properties in the same or adjacent suburb. Use realistic South African rand (ZAR) pricing — for SALE listings typical values are R900,000 – R25,000,000; for RENT listings R6,000 – R80,000 per month.

Respond with ONLY a JSON object with this shape:
{
  "comparables": [
    {
      "id": "string",
      "address": "string (SA street + suburb)",
      "suburb": "string",
      "price": number,
      "beds": number,
      "baths": number,
      "garages": number,
      "floorSize": number,
      "pricePerSqm": number,
      "daysOnMarket": number,
      "listingType": "${listingType}",
      "similarity": number (0-100)
    }
  ],
  "summary": "1-2 sentence plain-English market summary referencing medians and trends",
  "medianPrice": number,
  "averageDaysOnMarket": number
}

Subject property:
- Address: ${body.address ?? 'unknown'}
- Suburb: ${body.suburb ?? 'unknown'}${body.city ? ', ' + body.city : ''}${body.province ? ', ' + body.province : ''}
- Bedrooms: ${body.bedrooms ?? 'n/a'}
- Bathrooms: ${body.bathrooms ?? 'n/a'}
- Floor size (m²): ${body.floorSize ?? 'n/a'}
- Listing type: ${listingType}`;

  const parsed = await chatJSON<Omit<Result, 'cached'>>(
    [{ role: 'user', content: prompt }],
    { temperature: 0.4 },
  );

  if (!parsed || !Array.isArray(parsed.comparables) || parsed.comparables.length === 0) {
    return NextResponse.json({
      error: 'ai_unavailable',
      message:
        'AI market comparison is unavailable. Set GROQ_API_KEY to enable live comparables.',
    }, { status: 503 });
  }

  // Normalise ids & listing type.
  const comparables: Comparable[] = parsed.comparables.slice(0, 6).map((c, i) => ({
    id: c.id || `comp-${i + 1}`,
    address: c.address,
    suburb: c.suburb,
    price: Math.round(c.price),
    beds: Number(c.beds) || 0,
    baths: Number(c.baths) || 0,
    garages: Number(c.garages) || 0,
    floorSize: Number(c.floorSize) || 0,
    pricePerSqm: Math.round(Number(c.pricePerSqm) || (c.price / Math.max(1, Number(c.floorSize) || 1))),
    daysOnMarket: Number(c.daysOnMarket) || 30,
    listingType: c.listingType === 'rent' ? 'rent' : 'sale',
    similarity: Math.min(100, Math.max(0, Number(c.similarity) || 80)),
  }));

  const result: Result = {
    comparables,
    summary: parsed.summary ?? '',
    medianPrice: Math.round(
      parsed.medianPrice ||
        comparables.map((c) => c.price).sort((a, b) => a - b)[Math.floor(comparables.length / 2)],
    ),
    averageDaysOnMarket: Math.round(
      parsed.averageDaysOnMarket ||
        comparables.reduce((s, c) => s + c.daysOnMarket, 0) / comparables.length,
    ),
    cached: false,
  };

  await cacheSet(key, result, TTL_SECONDS);
  return NextResponse.json(result);
}
