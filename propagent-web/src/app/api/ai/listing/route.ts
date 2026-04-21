import { NextResponse } from 'next/server';
import { aiLimiter, checkLimit } from '@/lib/redis';
import { chatJSON } from '@/lib/openai-server';

export const runtime = 'nodejs';

type Body = {
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

type Result = {
  title: string;
  headlines: string[];
  description: string;
  bullets: string[];
  hashtags: string[];
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body.address && !body.suburb && !body.city) {
    return NextResponse.json({ error: 'location_required' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  const limit = await checkLimit(aiLimiter, `ai:listing:${ip}`);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'rate_limited', reset: limit.reset },
      { status: 429 },
    );
  }

  const tone = body.tone ?? 'family';
  const forSale = body.isForSale !== false;

  const prompt = `You are a senior South African real-estate copywriter. Write a listing for the property below. Use South African English, ZAR prices with 'R' prefix, and do not invent features that weren't mentioned. Keep it honest and POPIA-safe (no protected-class language).

Respond with ONLY a JSON object:
{
  "title": "60-80 char compelling title",
  "headlines": ["3-5 alternative short headlines"],
  "description": "120-200 word full listing body",
  "bullets": ["5-8 standout feature bullets"],
  "hashtags": ["#5-8 short marketing hashtags"]
}

Property:
- Type: ${body.propertyType ?? 'house'}
- Address: ${body.address ?? 'n/a'}
- Suburb/City: ${[body.suburb, body.city].filter(Boolean).join(', ') || 'n/a'}
- Bedrooms: ${body.bedrooms ?? 'n/a'}
- Bathrooms: ${body.bathrooms ?? 'n/a'}
- Parking: ${body.parking ?? 'n/a'}
- Erf size (m²): ${body.erfSize ?? 'n/a'}
- Floor area (m²): ${body.floorArea ?? 'n/a'}
- Price (ZAR): ${body.price ? 'R' + body.price.toLocaleString() : 'n/a'}
- Listing type: ${forSale ? 'For sale' : 'To let'}
- Features: ${body.features?.join(', ') || 'none listed'}
- Target tone: ${tone}`;

  const parsed = await chatJSON<Result>(
    [{ role: 'user', content: prompt }],
    { temperature: 0.6 },
  );

  if (!parsed || !parsed.title) {
    return NextResponse.json({
      error: 'ai_unavailable',
      message:
        'AI listing generator unavailable. Set GROQ_API_KEY to enable AI copy.',
    }, { status: 503 });
  }

  return NextResponse.json(parsed);
}
