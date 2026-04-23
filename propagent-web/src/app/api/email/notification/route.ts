import { NextResponse } from 'next/server';
import { z } from 'zod';
import { notificationEmail, sendEmail } from '@/lib/email';
import { checkLimit, writeLimiter } from '@/lib/redis';
import { apiError, apiOk, getRequestId } from '@/lib/api-response';
import { parseJsonBody } from '@/lib/validation';

export const runtime = 'nodejs';

const bodySchema = z.object({
  to: z.string().email(),
  recipientName: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  actionUrl: z.string().url().optional(),
  actionLabel: z.string().optional(),
});

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const parsedBody = await parseJsonBody(req, bodySchema, requestId);
  if ('response' in parsedBody) {
    return parsedBody.response;
  }
  const { to, recipientName, title, message, actionUrl, actionLabel } = parsedBody.data;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  const limit = await checkLimit(writeLimiter, `email:notification:${ip}`);
  if (!limit.success) {
    return apiError(requestId, 'rate_limited', 429, { reset: limit.reset });
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
    return apiError(requestId, result.error || 'email_failed', result.skipped ? 200 : 502, {
      skipped: result.skipped ?? false,
    });
  }
  return apiOk(requestId, { id: result.id });
}
