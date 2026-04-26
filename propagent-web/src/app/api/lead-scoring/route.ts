import { z } from 'zod';
import { aiLimiter, checkLimit, cacheSet } from '@/lib/redis';
import { chatComplete } from '@/lib/openai-server';
import { getAuthUser } from '@/lib/auth-server';
import { apiError, apiOk, getRequestId } from '@/lib/api-response';
import { parseJsonBody } from '@/lib/validation';

export const runtime = 'nodejs';

const bodySchema = z.object({
  leadData: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phoneNumber: z.string().min(10),
    creditScore: z.number().min(300).max(850).optional(),
    income: z.number().positive().optional(),
    employmentStatus: z.enum(['employed', 'self-employed', 'unemployed', 'retired']),
    propertyType: z.enum(['residential', 'commercial', 'investment']),
    loanAmount: z.number().positive(),
    loanPurpose: z.enum(['purchase', 'refinance', 'home-improvement']),
  }),
});

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const user = await getAuthUser(req);
  if (!user) return apiError(requestId, 'unauthenticated', 401);

  const parsedBody = await parseJsonBody(req, bodySchema, requestId);
  if ('response' in parsedBody) return parsedBody.response;
  const { leadData } = parsedBody.data;

  const limit = await checkLimit(aiLimiter, `ai:lead-scoring:${user.id}`);
  if (!limit.success) {
    return apiError(requestId, 'rate_limited', 429, { reset: limit.reset });
  }

  const prompt = `Analyze this lead and return a JSON object with keys: riskScore (0-100), riskCategory ("low"|"acceptable"|"high"), factors (string[]).

Lead:
- Name: ${leadData.fullName}
- Employment: ${leadData.employmentStatus}
- Property type: ${leadData.propertyType}
- Loan amount: ZAR ${leadData.loanAmount}
- Loan purpose: ${leadData.loanPurpose}
${leadData.creditScore ? `- Credit score: ${leadData.creditScore}` : ''}
${leadData.income ? `- Monthly income: ZAR ${leadData.income}` : ''}`;

  const raw = await chatComplete(
    [{ role: 'system', content: 'You are a South African property lead scoring engine. Return only JSON.' }, { role: 'user', content: prompt }],
    { temperature: 0.4 },
  );

  let aiResult: { riskScore?: number; riskCategory?: string; factors?: string[] } = {};
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) aiResult = JSON.parse(match[0]);
  } catch {
    aiResult = {};
  }

  const leadId = `LEAD-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const result = {
    leadId,
    status: 'scored',
    riskScore: aiResult.riskScore ?? 50,
    riskCategory: aiResult.riskCategory ?? 'acceptable',
    factors: aiResult.factors ?? [],
  };

  await cacheSet(`lead-score:${leadData.email}`, result, 3600);
  return apiOk(requestId, result);
}
