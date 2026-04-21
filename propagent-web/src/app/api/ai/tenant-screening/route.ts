import { NextResponse } from 'next/server';
import { aiLimiter, checkLimit } from '@/lib/redis';
import { chatJSON } from '@/lib/openai-server';

export const runtime = 'nodejs';

type Body = {
  name?: string;
  monthlyIncome?: number;
  monthlyRent?: number;
  creditScore?: number;
  employmentStatus?: string;
  employerTenureMonths?: number;
  hasPets?: boolean;
  petDetails?: string;
  references?: Array<{ landlord: string; response: 'good' | 'bad' | 'pending' | 'no_response' }>;
  prevEvictions?: number;
  notes?: string;
};

type Result = {
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

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body.monthlyIncome || !body.monthlyRent) {
    return NextResponse.json(
      { error: 'monthly_income_and_rent_required' },
      { status: 400 },
    );
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  const limit = await checkLimit(aiLimiter, `ai:tenant-screening:${ip}`);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'rate_limited', reset: limit.reset },
      { status: 429 },
    );
  }

  const prompt = `You are a South African rental-tenant screening analyst. Evaluate the applicant below against industry best practice (3x rent affordability, credit ≥ 650 strong / 500-650 borderline, stable employment, clean references, no prior evictions). Take account of ZAR salaries. Do NOT recommend decline on protected-class factors.

Return ONLY a JSON object with this shape:
{
  "recommendation": "approve" | "conditional" | "decline",
  "score": number (0-100),
  "checks": [
    { "name": "Income Verification", "status": "pass"|"fail"|"warning"|"pending", "details": "short reason" },
    { "name": "Credit Check", "status": "pass"|"fail"|"warning"|"pending", "details": "short reason" },
    { "name": "Employment Verification", "status": "pass"|"fail"|"warning"|"pending", "details": "short reason" },
    { "name": "Landlord References", "status": "pass"|"fail"|"warning"|"pending", "details": "short reason" }
  ],
  "riskFactors": ["short bullets"],
  "strengths": ["short bullets"],
  "narrative": "2-3 sentences plain English summary for the landlord"
}

Applicant:
- Name: ${body.name ?? 'unspecified'}
- Monthly income: R${body.monthlyIncome?.toLocaleString()}
- Monthly rent applied for: R${body.monthlyRent?.toLocaleString()}
- Credit score: ${body.creditScore ?? 'unknown'}
- Employment status: ${body.employmentStatus ?? 'unknown'}
- Employer tenure: ${body.employerTenureMonths ?? 'unknown'} months
- Pets: ${body.hasPets ? body.petDetails || 'yes' : 'no'}
- References: ${
    body.references
      ?.map((r) => `${r.landlord}: ${r.response}`)
      .join('; ') ?? 'none provided'
  }
- Prior evictions: ${body.prevEvictions ?? 0}
- Additional notes: ${body.notes ?? 'none'}`;

  const parsed = await chatJSON<Result>(
    [{ role: 'user', content: prompt }],
    { temperature: 0.2 },
  );

  if (!parsed || !parsed.recommendation) {
    return NextResponse.json({
      error: 'ai_unavailable',
      message:
        'AI tenant screening unavailable. Set GROQ_API_KEY to enable AI analysis.',
    }, { status: 503 });
  }

  return NextResponse.json(parsed);
}
