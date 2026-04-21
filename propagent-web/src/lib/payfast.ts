// PayFast integration — signed redirect checkout + ITN verification.
// https://developers.payfast.co.za/documentation/
//
// Server-only. Do NOT import from client code — the passphrase must never
// leave the server.

import 'server-only';
import { createHash } from 'crypto';

// Sandbox defaults taken from the public PayFast docs so the flow works
// end-to-end without credentials while we wait for real merchant creds.
const SANDBOX_MERCHANT_ID = '10000100';
const SANDBOX_MERCHANT_KEY = '46f0cd694581a';

export type PayFastMode = 'sandbox' | 'live';

function resolveMode(): PayFastMode {
  const m = (process.env.PAYFAST_MODE || '').toLowerCase();
  if (m === 'live') return 'live';
  return 'sandbox';
}

export function payfastConfig() {
  const mode = resolveMode();
  const merchantId =
    process.env.PAYFAST_MERCHANT_ID ||
    (mode === 'sandbox' ? SANDBOX_MERCHANT_ID : '');
  const merchantKey =
    process.env.PAYFAST_MERCHANT_KEY ||
    (mode === 'sandbox' ? SANDBOX_MERCHANT_KEY : '');
  // Passphrase is optional. When set in the PayFast dashboard it is also
  // appended to the signature string.
  const passphrase = process.env.PAYFAST_PASSPHRASE || '';

  const checkoutUrl =
    mode === 'live'
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process';
  const validateUrl =
    mode === 'live'
      ? 'https://www.payfast.co.za/eng/query/validate'
      : 'https://sandbox.payfast.co.za/eng/query/validate';

  return { mode, merchantId, merchantKey, passphrase, checkoutUrl, validateUrl };
}

// PayFast's signature spec:
// 1. Concatenate all submitted key=value pairs in the order they appear in
//    the submission, skipping the `signature` field and any empty values.
// 2. Values are URL-encoded with + for spaces (application/x-www-form-urlencoded).
// 3. Append &passphrase=<urlencoded passphrase> if a passphrase is configured.
// 4. MD5 the resulting string (lowercase hex).
//
// For ITN verification PayFast explicitly states: use the original order the
// fields arrived in. For checkout redirects we control the order so we keep
// the one used in payfastCheckoutParams().
function encodeValue(v: string): string {
  return encodeURIComponent(v).replace(/%20/g, '+');
}

export function payfastSignature(
  params: Record<string, string>,
  passphrase: string,
  fieldOrder?: string[],
): string {
  const keys = fieldOrder ?? Object.keys(params);
  const pairs: string[] = [];
  for (const k of keys) {
    if (k === 'signature') continue;
    const v = params[k];
    if (v === undefined || v === null || v === '') continue;
    pairs.push(`${k}=${encodeValue(String(v).trim())}`);
  }
  let paramString = pairs.join('&');
  if (passphrase) {
    paramString += `&passphrase=${encodeValue(passphrase.trim())}`;
  }
  return createHash('md5').update(paramString).digest('hex');
}

export type CheckoutInput = {
  mPaymentId: string;
  amount: number; // ZAR
  itemName: string;
  itemDescription?: string;
  nameFirst?: string;
  nameLast?: string;
  emailAddress?: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  // Subscription fields (only sent when subscribe=true).
  subscribe?: boolean;
  recurringAmount?: number;
  frequency?: 3 | 4 | 5 | 6; // 3=monthly, 4=quarterly, 5=biannual, 6=annual
  cycles?: number; // 0 = indefinite
  // Arbitrary trace fields — we use these to tie ITN callbacks back to the user.
  customStr1?: string;
  customStr2?: string;
};

export type CheckoutResult = {
  url: string;
  fields: Record<string, string>;
};

export function buildCheckout(input: CheckoutInput): CheckoutResult {
  const cfg = payfastConfig();
  if (!cfg.merchantId || !cfg.merchantKey) {
    throw new Error('PayFast merchant credentials are not configured');
  }

  const fields: Record<string, string> = {
    merchant_id: cfg.merchantId,
    merchant_key: cfg.merchantKey,
    return_url: input.returnUrl,
    cancel_url: input.cancelUrl,
    notify_url: input.notifyUrl,
    ...(input.nameFirst ? { name_first: input.nameFirst } : {}),
    ...(input.nameLast ? { name_last: input.nameLast } : {}),
    ...(input.emailAddress ? { email_address: input.emailAddress } : {}),
    m_payment_id: input.mPaymentId,
    amount: input.amount.toFixed(2),
    item_name: input.itemName,
    ...(input.itemDescription
      ? { item_description: input.itemDescription }
      : {}),
    ...(input.customStr1 ? { custom_str1: input.customStr1 } : {}),
    ...(input.customStr2 ? { custom_str2: input.customStr2 } : {}),
  };

  if (input.subscribe) {
    fields.subscription_type = '1';
    if (input.recurringAmount != null) {
      fields.recurring_amount = input.recurringAmount.toFixed(2);
    }
    if (input.frequency != null) {
      fields.frequency = String(input.frequency);
    }
    if (input.cycles != null) {
      fields.cycles = String(input.cycles);
    }
  }

  const order = Object.keys(fields);
  fields.signature = payfastSignature(fields, cfg.passphrase, order);

  // We redirect via a GET URL (PayFast supports GET for checkout) so that
  // the entire sign + url build happens server-side and the browser just
  // follows a 302. This avoids leaking merchant_key / signature into any
  // client-visible form HTML.
  const qs = Object.entries(fields)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeValue(v)}`)
    .join('&');
  return { url: `${cfg.checkoutUrl}?${qs}`, fields };
}

// Verifies an incoming ITN payload:
// 1. Signature matches (using the original field order from the request).
// 2. PayFast postback to the validate endpoint returns "VALID".
// The caller still needs to verify the amount matches the expected amount
// and that the m_payment_id corresponds to a pending row we created.
export async function verifyItn(
  fields: Record<string, string>,
  fieldOrder: string[],
  rawBody: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const cfg = payfastConfig();

  // 1. Signature
  const expected = payfastSignature(fields, cfg.passphrase, fieldOrder);
  if (!fields.signature || fields.signature.toLowerCase() !== expected) {
    return { ok: false, reason: 'signature_mismatch' };
  }

  // 2. Postback. PayFast expects the exact same body back and replies with
  // "VALID" or "INVALID".
  try {
    const res = await fetch(cfg.validateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: rawBody,
    });
    const text = (await res.text()).trim();
    if (text !== 'VALID') {
      return { ok: false, reason: `postback_${text || 'empty'}` };
    }
  } catch (err) {
    return {
      ok: false,
      reason: `postback_error_${(err as Error).message}`,
    };
  }

  return { ok: true };
}

export function parseItnForm(body: string): {
  fields: Record<string, string>;
  order: string[];
} {
  const fields: Record<string, string> = {};
  const order: string[] = [];
  for (const pair of body.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    if (eq < 0) continue;
    const k = decodeURIComponent(pair.slice(0, eq));
    const v = decodeURIComponent(pair.slice(eq + 1).replace(/\+/g, ' '));
    fields[k] = v;
    order.push(k);
  }
  return { fields, order };
}
