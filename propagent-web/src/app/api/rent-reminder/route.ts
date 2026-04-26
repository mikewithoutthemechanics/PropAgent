import { z } from 'zod';
import { aiLimiter, checkLimit, cacheSet } from '@/lib/redis';
import { chatComplete } from '@/lib/openai-server';
import { getAuthUser } from '@/lib/auth-server';
import { apiError, apiOk, getRequestId } from '@/lib/api-response';
import { parseJsonBody } from '@/lib/validation';

export const runtime = 'nodejs';

const bodySchema = z.object({
  tenantId: z.string().min(1),
  propertyId: z.string().min(1),
  rentAmount: z.number().positive(),
  dueDate: z.string(),
});

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const user = await getAuthUser(req);
  if (!user) return apiError(requestId, 'unauthenticated', 401);

  const parsedBody = await parseJsonBody(req, bodySchema, requestId);
  if ('response' in parsedBody) return parsedBody.response;
  const { tenantId, rentAmount, dueDate } = parsedBody.data;

  const limit = await checkLimit(aiLimiter, `ai:rent-reminder:${user.id}`);
  if (!limit.success) {
    return apiError(requestId, 'rate_limited', 429, { reset: limit.reset });
  }

  const raw = await chatComplete(
    [
      { role: 'system', content: 'Generate a professional, friendly rent reminder for a South African tenant. Return JSON with keys: message (string), urgencyLevel ("low"|"medium"|"high"), subject (string).' },
      { role: 'user', content: `Rent amount: ZAR ${rentAmount}, Due date: ${dueDate}` },
    ],
    { temperature: 0.4 },
  );

  let aiResult: { message?: string; urgencyLevel?: string; subject?: string } = {};
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) aiResult = JSON.parse(match[0]);
  } catch {
    aiResult = {};
  }

  const reminderId = `RENT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const result = {
    reminderId,
    status: 'generated',
    tenantId,
    urgencyLevel: aiResult.urgencyLevel ?? 'medium',
    message: aiResult.message ?? 'Your rent payment is due. Please ensure timely payment.',
    subject: aiResult.subject ?? 'Rent Payment Reminder',
    sendVia: ['email', 'sms'],
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  await cacheSet(`rent-reminder:${tenantId}`, result, 86400);
  return apiOk(requestId, result);
}
