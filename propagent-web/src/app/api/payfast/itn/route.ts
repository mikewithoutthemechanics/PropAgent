// PayFast ITN (Instant Transaction Notification) webhook.
//
// PayFast posts here after a payment (pending, complete, cancelled, failed).
// We:
//   1. Parse the form body in the exact order PayFast sent it.
//   2. Verify the signature against our passphrase.
//   3. Postback to PayFast's validate endpoint to confirm authenticity.
//   4. Match the m_payment_id to a pending subscription row, and the
//      reported amount to the price we staged for that row.
//   5. Flip the subscription + profile to the correct state.
//
// We ALWAYS respond 200 to PayFast (their docs require it), but log any
// validation failures server-side.

import { NextResponse } from 'next/server';
import { parseItnForm, verifyItn } from '@/lib/payfast';
import {
  supabaseAdmin,
  supabaseAdminConfigured,
} from '@/lib/supabase-admin';
import { getPlan } from '@/lib/plans';

export const runtime = 'nodejs';

type SubscriptionStatus = 'pending' | 'active' | 'cancelled' | 'failed';

function statusFromPaymentStatus(paymentStatus: string): SubscriptionStatus {
  switch (paymentStatus) {
    case 'COMPLETE':
      return 'active';
    case 'CANCELLED':
      return 'cancelled';
    case 'FAILED':
      return 'failed';
    default:
      return 'pending';
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const { fields, order } = parseItnForm(rawBody);

  const result = await verifyItn(fields, order, rawBody);
  if (!result.ok) {
    console.warn('[payfast/itn] rejected:', result.reason, {
      m_payment_id: fields.m_payment_id,
      pf_payment_id: fields.pf_payment_id,
      payment_status: fields.payment_status,
    });
    // PayFast retries on non-200s; we return 200 so they don't retry an
    // invalid / forged request indefinitely.
    return NextResponse.json({ ok: false, reason: result.reason });
  }

  const mPaymentId = fields.m_payment_id;
  const paymentStatus = fields.payment_status ?? 'UNKNOWN';
  const userIdFromCustom = fields.custom_str1;
  const planIdFromCustom = fields.custom_str2;
  const amountGross = parseFloat(fields.amount_gross || '0');

  if (!mPaymentId) {
    console.warn('[payfast/itn] missing m_payment_id');
    return NextResponse.json({ ok: false, reason: 'missing_m_payment_id' });
  }

  if (!supabaseAdminConfigured) {
    console.warn('[payfast/itn] supabase admin not configured; cannot persist');
    return NextResponse.json({ ok: true, skipped: 'no_admin_client' });
  }

  const admin = supabaseAdmin();

  // Fetch the pending row. If we can't find one, we still record the payment
  // event so it's auditable.
  const { data: existing, error: selectErr } = await admin
    .from('subscriptions')
    .select('id, user_id, plan_id, price_zar, status')
    .eq('id', mPaymentId)
    .maybeSingle();

  if (selectErr) {
    console.warn('[payfast/itn] subscription lookup failed', selectErr);
  }

  // Amount sanity check — ignore non-complete states since PayFast sends
  // different amount fields for those.
  if (
    existing &&
    paymentStatus === 'COMPLETE' &&
    Math.abs(amountGross - Number(existing.price_zar)) > 0.01
  ) {
    console.warn('[payfast/itn] amount mismatch', {
      expected: existing.price_zar,
      got: amountGross,
    });
    return NextResponse.json({ ok: false, reason: 'amount_mismatch' });
  }

  const newStatus = statusFromPaymentStatus(paymentStatus);
  const userId = existing?.user_id ?? userIdFromCustom;
  const planId = existing?.plan_id ?? planIdFromCustom;

  try {
    if (existing) {
      await admin
        .from('subscriptions')
        .update({
          status: newStatus,
          payfast_token: fields.token || null,
          pf_payment_id: fields.pf_payment_id || null,
          last_payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', mPaymentId);
    } else if (userId && planId) {
      // No pending row (e.g. ITN fired before initiate persisted). Insert
      // an after-the-fact row so state stays consistent.
      await admin.from('subscriptions').insert({
        id: mPaymentId,
        user_id: userId,
        plan_id: planId,
        price_zar: amountGross,
        status: newStatus,
        payfast_token: fields.token || null,
        pf_payment_id: fields.pf_payment_id || null,
        last_payment_status: paymentStatus,
      });
    }

    // Audit log — one row per ITN callback.
    await admin.from('payfast_events').insert({
      m_payment_id: mPaymentId,
      pf_payment_id: fields.pf_payment_id || null,
      user_id: userId ?? null,
      plan_id: planId ?? null,
      payment_status: paymentStatus,
      amount_gross: Number.isFinite(amountGross) ? amountGross : null,
      raw: fields,
    });

    // Roll the user's profile forward on success. On cancellation or
    // failure we leave the profile alone so the user doesn't get booted
    // mid-cycle for a transient issue.
    if (userId && planId && newStatus === 'active') {
      await admin
        .from('profiles')
        .update({
          subscription_tier: planId,
          subscription_status: 'active',
          subscription_updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }
  } catch (err) {
    console.warn('[payfast/itn] write failed', err);
  }

  return NextResponse.json({ ok: true });
}
