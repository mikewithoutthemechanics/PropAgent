import { NextResponse } from 'next/server';
import { aiLimiter, checkLimit } from '@/lib/redis';
import { chatJSON } from '@/lib/openai-server';

export const runtime = 'nodejs';

type Body = {
  issue?: string;
  property?: string;
  reportedBy?: string;
};

type Result = {
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'pest' | 'other';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedCost: number;
  estimatedCostRange: { low: number; high: number };
  rationale: string;
  recommendedVendor: string;
  suggestedSlaHours: number;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body.issue) {
    return NextResponse.json({ error: 'issue_required' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  const limit = await checkLimit(aiLimiter, `ai:maintenance:${ip}`);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'rate_limited', reset: limit.reset },
      { status: 429 },
    );
  }

  const prompt = `You are a South African property-maintenance triage assistant. Given a tenant-reported issue below, classify category, priority, and estimate cost in ZAR using realistic SA tradesperson rates (typical R350-R800/hour, geyser replacement ~R12,000-R18,000, aircon service ~R1,000-R3,500, blocked drain ~R650-R2,500, electrical fault ~R800-R4,000, roof leak ~R2,500-R15,000).

Respond with ONLY a JSON object:
{
  "category": "plumbing" | "electrical" | "hvac" | "appliance" | "structural" | "pest" | "other",
  "priority": "urgent" | "high" | "medium" | "low",
  "estimatedCost": number (midpoint, ZAR),
  "estimatedCostRange": { "low": number, "high": number },
  "rationale": "1 sentence explaining the classification",
  "recommendedVendor": "short vendor type (e.g. 'Licensed plumber', 'Electrician')",
  "suggestedSlaHours": number (target response time)
}

Report:
- Issue: ${body.issue}
- Property: ${body.property ?? 'unspecified'}
- Reported by: ${body.reportedBy ?? 'tenant'}`;

  const parsed = await chatJSON<Result>(
    [{ role: 'user', content: prompt }],
    { temperature: 0.2 },
  );

  if (!parsed || !parsed.category) {
    return NextResponse.json({
      error: 'ai_unavailable',
      message:
        'AI maintenance triage unavailable. Set GROQ_API_KEY to enable auto-classification.',
    }, { status: 503 });
  }

  return NextResponse.json(parsed);
}
