import { NextResponse } from 'next/server';
import { notificationEmail, sendEmail } from '@/lib/email';
import { checkLimit, writeLimiter } from '@/lib/redis';

export const runtime = 'nodejs';

type Body = {
  to?: string;
  recipientName?: string;
  title?: string;
  message?: string;
  actionUrl?: string;
  actionLabel?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const { to, recipientName, title, message, actionUrl, actionLabel } = body;
  if (!to || !recipientName || !title || !message) {
    return NextResponse.json(
      { error: 'to_recipientName_title_message_required' },
      { status: 400 },
    );
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  const limit = await checkLimit(writeLimiter, `email:notification:${ip}`);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'rate_limited', reset: limit.reset },
      { status: 429 },
    );
  }

  const result = await sendEmail(
    notificationEmail({
      to,
      recipientName,
      notificationTitle: title,
      notificationBody: message,
      actionUrl,
      actionLabel,
    }),
  );
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, skipped: result.skipped ?? false },
      { status: result.skipped ? 200 : 502 },
    );
  }
  return NextResponse.json({ ok: true, id: result.id });
}
