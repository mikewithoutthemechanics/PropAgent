import { NextResponse } from 'next/server';
import { aiLimiter, checkLimit } from '@/lib/redis';
import { chatComplete, ChatMessage } from '@/lib/openai-server';

export const runtime = 'nodejs';

type Body = {
  messages?: ChatMessage[];
  systemPrompt?: string;
};

const DEFAULT_SYSTEM = `You are AgentPing, an AI assistant inside a South African property-management app.
You help agents manage properties, tenants, maintenance, leases, and leads. Be concise, professional,
and reference rand (ZAR) amounts where money is discussed. If asked something outside property
management, politely decline.`;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const messages = body.messages ?? [];
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages_required' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  const limit = await checkLimit(aiLimiter, `ai:chat:${ip}`);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'rate_limited', reset: limit.reset, remaining: limit.remaining },
      { status: 429 },
    );
  }

  const system: ChatMessage = { role: 'system', content: body.systemPrompt ?? DEFAULT_SYSTEM };
  const reply = await chatComplete([system, ...messages]);
  return NextResponse.json(
    { reply },
    { headers: { 'x-ratelimit-remaining': String(limit.remaining) } },
  );
}
