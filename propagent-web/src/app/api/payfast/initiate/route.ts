import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { buildCheckout, payfastConfig } from '@/lib/payfast';
import { supabaseAdmin, supabaseAdminConfigured } from '@/lib/supabase-admin';
import { getPlan } from '@/lib/plans';
import { checkLimit, writeLimiter } from '@/lib/redis';

export const runtime = 'nodejs';

type Body = {
  planId?: string;
  userId?: string; // optional override; we prefer the session user
};

function originFrom(req: Request): string {
  const h = new Headers(req.headers);
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://propagent-web-one.vercel.app';
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const plan = body.planId ? getPlan(body.planId) : undefined;
  if (!plan || !plan.paid) {
    return NextResponse.json({ error: 'invalid_plan' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  const limit = await checkLimit(writeLimiter, `payfast:initiate:${ip}`);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'rate_limited', reset: limit.reset },
      { status: 429 },
    );
  }

  // Resolve the paying user from the Supabase access token that the browser
  // sends in the Authorization header. Falling back to the optional body
  // userId is only used for local development.
  let userId: string | undefined = body.userId;
  let userEmail: string | undefined;
  let userFirstName: string | undefined;
  let userLastName: string | undefined;

  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : undefined;

  if (supabaseAdminConfigured && token) {
    try {
      const { data, error } = await supabaseAdmin().auth.getUser(token);
      if (!error && data.user) {
        userId = data.user.id;
        userEmail = data.user.email ?? undefined;
        const meta = (data.user.user_metadata || {}) as Record<string, unknown>;
        userFirstName =
          typeof meta.first_name === 'string' ? meta.first_name : undefined;
        userLastName =
          typeof meta.last_name === 'string' ? meta.last_name : undefined;
      }
    } catch {
      // Ignore — userId stays undefined and we reject below.
    }
  }

  if (!userId) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  // Persist a pending subscription row so the ITN webhook can match it up.
  // We allow this to fail (e.g. in local dev without service_role) and fall
  // back to a client-generated m_payment_id — the ITN handler will log but
  // not crash.
  const mPaymentId = randomUUID();
  if (supabaseAdminConfigured) {
    try {
      const admin = supabaseAdmin();
      await admin.from('subscriptions').insert({
        id: mPaymentId,
        user_id: userId,
        plan_id: plan.id,
        price_zar: plan.priceZar,
        status: 'pending',
      });
    } catch (err) {
      console.warn('[payfast/initiate] failed to insert pending subscription', err);
    }
  }

  const origin = originFrom(req);
  const checkout = buildCheckout({
    mPaymentId,
    amount: plan.priceZar,
    itemName: `Agent Loop ${plan.name}`,
    itemDescription: plan.description,
    nameFirst: userFirstName,
    nameLast: userLastName,
    emailAddress: userEmail,
    returnUrl: `${origin}/billing/success?ref=${mPaymentId}`,
    cancelUrl: `${origin}/billing/cancel?ref=${mPaymentId}`,
    notifyUrl: `${origin}/api/payfast/itn`,
    subscribe: true,
    recurringAmount: plan.priceZar,
    frequency: 3, // monthly
    cycles: 0, // indefinite
    customStr1: userId,
    customStr2: plan.id,
  });

  const cfg = payfastConfig();
  return NextResponse.json({
    url: checkout.url,
    mPaymentId,
    mode: cfg.mode,
  });
}
