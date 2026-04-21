import { NextResponse } from 'next/server';
import { leaseExpiryEmail, sendEmail } from '@/lib/email';
import { checkLimit, writeLimiter } from '@/lib/redis';

export const runtime = 'nodejs';

type Body = {
  to?: string;
  tenantName?: string;
  propertyAddress?: string;
  daysUntilExpiry?: number;
  leaseEndDate?: string;
  renewalUrl?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const { to, tenantName, propertyAddress, daysUntilExpiry, leaseEndDate, renewalUrl } = body;
  if (!to || !tenantName || !propertyAddress || daysUntilExpiry === undefined || !leaseEndDate) {
    return NextResponse.json({ error: 'missing_required_fields' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  const limit = await checkLimit(writeLimiter, `email:lease:${ip}`);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'rate_limited', reset: limit.reset },
      { status: 429 },
    );
  }

  const result = await sendEmail(
    leaseExpiryEmail({ to, tenantName, propertyAddress, daysUntilExpiry, leaseEndDate, renewalUrl }),
  );
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, skipped: result.skipped ?? false },
      { status: result.skipped ? 200 : 502 },
    );
  }
  return NextResponse.json({ ok: true, id: result.id });
}
