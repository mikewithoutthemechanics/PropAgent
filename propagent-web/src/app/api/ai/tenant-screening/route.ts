import { z } from 'zod';
import { aiLimiter, checkLimit } from '@/lib/redis';
import { chatJSON } from '@/lib/openai-server';
import { apiError, apiOk, getRequestId } from '@/lib/api-response';
import { parseJsonBody } from '@/lib/validation';

export const runtime = 'nodejs';

const bodySchema = z.object({
  name: z.string().optional(),
  monthlyIncome: z.number().positive(),
  monthlyRent: z.number().positive(),
  creditScore: z.number().optional(),
  employmentStatus: z.string().optional(),
  employerTenureMonths: z.number().optional(),
  hasPets: z.boolean().optional(),
  petDetails: z.string().optional(),
  references: z
    .array(
      z.object({
        landlord: z.string(),
        response: z.enum(['good', 'bad', 'pending', 'no_response']),
      }),
    )
    .optional(),
  prevEvictions: z.number().optional(),
  notes: z.string().optional(),
});

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
  const requestId = getRequestId(req);
  const parsedBody = await parseJsonBody(req, bodySchema, requestId);
  if ('response' in parsedBody) {
    return parsedBody.response;
  }
  const body = parsedBody.data;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  const limit = await checkLimit(aiLimiter, `ai:tenant-screening:${ip}`);
  if (!limit.success) {
    return apiError(requestId, 'rate_limited', 429, { reset: limit.reset });
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
    return apiError(requestId, 'ai_unavailable', 503, {
      message:
        'AI tenant screening unavailable. Set GROQ_API_KEY to enable AI analysis.',
    });
  }

  return apiOk(requestId, { result: parsed });
}
