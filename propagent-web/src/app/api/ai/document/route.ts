import { NextResponse } from 'next/server';
import { aiLimiter, checkLimit } from '@/lib/redis';
import { chatComplete } from '@/lib/openai-server';

export const runtime = 'nodejs';

type Body = {
  templateName?: string;
  category?: string;
  fields?: Record<string, string | number>;
  notes?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body.templateName) {
    return NextResponse.json({ error: 'template_name_required' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  const limit = await checkLimit(aiLimiter, `ai:document:${ip}`);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'rate_limited', reset: limit.reset },
      { status: 429 },
    );
  }

  const fieldsList = Object.entries(body.fields ?? {})
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  const prompt = `You are a South African property/legal document drafter. Produce a complete, professionally-worded draft of the document below. Use South African law, ZAR amounts, and clear headings. Do NOT include placeholders like {{field}} — substitute all provided fields into the body. Output plain text only (no markdown code fences).

Document: ${body.templateName}
Category: ${body.category ?? 'agreement'}

Field values:
${fieldsList || '(none supplied — use sensible SA defaults and note them as "[TO CONFIRM]")'}

Additional notes: ${body.notes ?? 'none'}`;

  const body_text = await chatComplete(
    [
      {
        role: 'system',
        content:
          'You draft plain-text South African property documents. Be concise, correct, and use headings.',
      },
      { role: 'user', content: prompt },
    ],
    { temperature: 0.3 },
  );

  if (!body_text || body_text.startsWith('(demo mode')) {
    return NextResponse.json({
      error: 'ai_unavailable',
      message:
        'AI document generator unavailable. Set GROQ_API_KEY to enable AI drafting.',
    }, { status: 503 });
  }

  return NextResponse.json({ body: body_text });
}
