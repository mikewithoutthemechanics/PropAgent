import { NextResponse } from 'next/server';
import { aiLimiter, cacheGet, cacheSet, checkLimit } from '@/lib/redis';
import { chatComplete } from '@/lib/openai-server';

export const runtime = 'nodejs';

type Body = {
  address?: string;
  suburb?: string;
  city?: string;
  province?: string;
  bedrooms?: number;
  bathrooms?: number;
  garages?: number;
  erfSize?: number;
  floorSize?: number;
};

type ValuationResult = {
  estimatedValue: number;
  lowerBound: number;
  upperBound: number;
  rationale: string;
  cached: boolean;
};

const TTL_SECONDS = 60 * 60 * 24; // 24h

function cacheKey(b: Body): string {
  const norm = [
    (b.address ?? '').trim().toLowerCase(),
    (b.suburb ?? '').trim().toLowerCase(),
    (b.city ?? '').trim().toLowerCase(),
    (b.province ?? '').trim().toLowerCase(),
    String(b.bedrooms ?? ''),
    String(b.bathrooms ?? ''),
    String(b.garages ?? ''),
    String(b.erfSize ?? ''),
    String(b.floorSize ?? ''),
  ].join('|');
  return `propagent:valuation:${norm}`;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body.address || !body.suburb) {
    return NextResponse.json({ error: 'address_and_suburb_required' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  const limit = await checkLimit(aiLimiter, `ai:valuation:${ip}`);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'rate_limited', reset: limit.reset },
      { status: 429 },
    );
  }

  const key = cacheKey(body);
  const cached = await cacheGet<ValuationResult>(key);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  const prompt = `You are a South African property valuation model. Given the property below, return ONLY a JSON object
with keys: estimatedValue (integer rand), lowerBound (integer), upperBound (integer), rationale (1-2 sentences).
Do not include any other text.

Property:
- Address: ${body.address}
- Suburb: ${body.suburb}${body.city ? ', ' + body.city : ''}${body.province ? ', ' + body.province : ''}
- Bedrooms: ${body.bedrooms ?? 'n/a'}
- Bathrooms: ${body.bathrooms ?? 'n/a'}
- Garages: ${body.garages ?? 'n/a'}
- Erf size (m²): ${body.erfSize ?? 'n/a'}
- Floor size (m²): ${body.floorSize ?? 'n/a'}`;

  const raw = await chatComplete(
    [{ role: 'user', content: prompt }],
    { temperature: 0.2 },
  );

  let parsed: Omit<ValuationResult, 'cached'> | null = null;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  } catch {
    parsed = null;
  }

  if (!parsed || typeof parsed.estimatedValue !== 'number') {
    const fallback: ValuationResult = {
      estimatedValue: 1_500_000,
      lowerBound: 1_250_000,
      upperBound: 1_750_000,
      rationale:
        'Fallback estimate — AI response could not be parsed. Configure OPENAI_API_KEY for real valuations.',
      cached: false,
    };
    return NextResponse.json(fallback);
  }

  const result: ValuationResult = { ...parsed, cached: false };
  await cacheSet(key, result, TTL_SECONDS);
  return NextResponse.json(result);
}
