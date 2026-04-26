import { z } from 'zod';
import { aiLimiter, checkLimit, cacheSet } from '@/lib/redis';
import { chatComplete } from '@/lib/openai-server';
import { getAuthUser } from '@/lib/auth-server';
import { apiError, apiOk, getRequestId } from '@/lib/api-response';
import { parseJsonBody } from '@/lib/validation';

export const runtime = 'nodejs';

const bodySchema = z.object({
  emailContent: z.string().min(10),
  intentType: z.enum(['enquiry', 'complaint', 'application', 'document-request', 'general']).optional(),
});

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const user = await getAuthUser(req);
  if (!user) return apiError(requestId, 'unauthenticated', 401);

  const parsedBody = await parseJsonBody(req, bodySchema, requestId);
  if ('response' in parsedBody) return parsedBody.response;
  const { emailContent } = parsedBody.data;

  const limit = await checkLimit(aiLimiter, `ai:email-intent:${user.id}`);
  if (!limit.success) {
    return apiError(requestId, 'rate_limited', 429, { reset: limit.reset });
  }

  const raw = await chatComplete(
    [
      { role: 'system', content: 'Classify the intent of this property management email. Return JSON with keys: intent ("enquiry"|"complaint"|"application"|"maintenance"|"general"), confidence (0-100), action ("auto_reply"|"forward"|"review"|"escalate"), summary (string).' },
      { role: 'user', content: emailContent.slice(0, 1000) },
    ],
    { temperature: 0.3 },
  );

  let aiResult: { intent?: string; confidence?: number; action?: string; summary?: string } = {};
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) aiResult = JSON.parse(match[0]);
  } catch {
    aiResult = {};
  }

  const analysisId = `INT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const result = {
    analysisId,
    status: 'analyzed',
    confidence: aiResult.confidence ?? 70,
    intent: aiResult.intent ?? 'general',
    action: aiResult.action ?? 'review',
    summary: aiResult.summary ?? '',
  };

  await cacheSet(`email-intent:${analysisId}`, result, 3600);
  return apiOk(requestId, result);
}
