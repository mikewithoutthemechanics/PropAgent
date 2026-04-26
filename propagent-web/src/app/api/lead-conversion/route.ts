import { z } from 'zod';
import { aiLimiter, checkLimit, cacheSet } from '@/lib/redis';
import { chatComplete } from '@/lib/openai-server';
import { getAuthUser } from '@/lib/auth-server';
import { apiError, apiOk, getRequestId } from '@/lib/api-response';
import { parseJsonBody } from '@/lib/validation';

export const runtime = 'nodejs';

const bodySchema = z.object({
  leadId: z.string().min(1),
  leadData: z.object({
    email: z.string().email(),
    interestLevel: z.enum(['low', 'medium', 'high']),
  }),
});

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const user = await getAuthUser(req);
  if (!user) return apiError(requestId, 'unauthenticated', 401);

  const parsedBody = await parseJsonBody(req, bodySchema, requestId);
  if ('response' in parsedBody) return parsedBody.response;
  const { leadId, leadData } = parsedBody.data;

  const limit = await checkLimit(aiLimiter, `ai:lead-conversion:${user.id}`);
  if (!limit.success) {
    return apiError(requestId, 'rate_limited', 429, { reset: limit.reset });
  }

  const raw = await chatComplete(
    [
      { role: 'system', content: 'Predict lead conversion probability for a South African property lead. Return JSON with keys: conversionProbability (0-100), action ("nurture"|"call"|"close"|"disqualify"), factors (string[]).' },
      { role: 'user', content: `Lead ID: ${leadId}, Interest level: ${leadData.interestLevel}, Email: ${leadData.email}` },
    ],
    { temperature: 0.3 },
  );

  let aiResult: { conversionProbability?: number; action?: string; factors?: string[] } = {};
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) aiResult = JSON.parse(match[0]);
  } catch {
    aiResult = {};
  }

  const conversionId = `CNV-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const result = {
    conversionId,
    status: 'analyzed',
    probability: aiResult.conversionProbability ?? 30,
    action: aiResult.action ?? 'nurture',
    factors: aiResult.factors ?? [],
  };

  await cacheSet(`conversion:${leadId}`, result, 3600);
  return apiOk(requestId, result);
}
