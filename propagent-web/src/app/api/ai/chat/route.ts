import { z } from 'zod';
import { aiLimiter, checkLimit } from '@/lib/redis';
import { chatComplete, ChatMessage } from '@/lib/openai-server';
import { apiError, apiOk, getRequestId } from '@/lib/api-response';
import { parseJsonBody } from '@/lib/validation';

export const runtime = 'nodejs';

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string().min(1),
      }),
    )
    .min(1),
  systemPrompt: z.string().min(1).optional(),
});

const DEFAULT_SYSTEM = `You are Agent Loop, an AI assistant inside a South African property-management app.
You help agents manage properties, tenants, maintenance, leases, and leads. Be concise, professional,
and reference rand (ZAR) amounts where money is discussed. If asked something outside property
management, politely decline.`;

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const parsedBody = await parseJsonBody(req, bodySchema, requestId);
  if ('response' in parsedBody) {
    return parsedBody.response;
  }
  const { messages, systemPrompt } = parsedBody.data;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  const limit = await checkLimit(aiLimiter, `ai:chat:${ip}`);
  if (!limit.success) {
    return apiError(requestId, 'rate_limited', 429, {
      reset: limit.reset,
      remaining: limit.remaining,
    });
  }

  const system: ChatMessage = { role: 'system', content: systemPrompt ?? DEFAULT_SYSTEM };
  const reply = await chatComplete([system, ...messages]);
  const response = apiOk(requestId, { reply });
  response.headers.set('x-ratelimit-remaining', String(limit.remaining));
  return response;
}
