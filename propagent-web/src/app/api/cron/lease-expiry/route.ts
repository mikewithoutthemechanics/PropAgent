// Daily cron: find tenants whose leases expire in 30/14/7/1 days and email them.
//
// Scheduled via vercel.json (runs daily at 08:00 UTC). Protected by
// CRON_SECRET if set: requests must include either Vercel's built-in
// Authorization: Bearer <CRON_SECRET> header, or ?secret=<CRON_SECRET>.

import { NextResponse } from 'next/server';
import { sendEmail, leaseExpiryEmail } from '@/lib/email';
import { supabaseAdmin, supabaseAdminConfigured } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REMINDER_DAYS = [30, 14, 7, 1];

type TenantRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  lease_end: string | null;
  property_id: string | null;
};

type PropertyRow = {
  id: string;
  address: string | null;
  suburb: string | null;
};

function authOk(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // unprotected if no secret is configured
  const auth = req.headers.get('authorization') ?? '';
  if (auth === `Bearer ${secret}`) return true;
  const url = new URL(req.url);
  return url.searchParams.get('secret') === secret;
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

export async function GET(req: Request) {
  if (!authOk(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!supabaseAdminConfigured) {
    return NextResponse.json(
      { ok: false, error: 'supabase_admin_not_configured', sent: 0 },
      { status: 200 },
    );
  }

  const sb = supabaseAdmin();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const { data: tenants, error } = await sb
    .from('tenants')
    .select('id, email, first_name, last_name, lease_end, property_id')
    .not('lease_end', 'is', null)
    .not('email', 'is', null);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const rows = (tenants ?? []) as TenantRow[];
  const toNotify = rows
    .map((t) => {
      if (!t.lease_end || !t.email) return null;
      const end = new Date(t.lease_end);
      end.setUTCHours(0, 0, 0, 0);
      const days = daysBetween(today, end);
      if (!REMINDER_DAYS.includes(days)) return null;
      return { tenant: t, days, end };
    })
    .filter((x): x is { tenant: TenantRow; days: number; end: Date } => x !== null);

  // Fetch relevant properties in one go.
  const propertyIds = Array.from(
    new Set(toNotify.map((n) => n.tenant.property_id).filter((id): id is string => Boolean(id))),
  );
  let propertyMap = new Map<string, string>();
  if (propertyIds.length > 0) {
    const { data: props } = await sb
      .from('properties')
      .select('id, address, suburb')
      .in('id', propertyIds);
    for (const p of (props ?? []) as PropertyRow[]) {
      propertyMap.set(p.id, [p.address, p.suburb].filter(Boolean).join(', '));
    }
  }

  let sent = 0;
  let failed = 0;
  for (const { tenant, days, end } of toNotify) {
    const name = [tenant.first_name, tenant.last_name].filter(Boolean).join(' ') || 'there';
    const address = (tenant.property_id && propertyMap.get(tenant.property_id)) || 'your property';
    const res = await sendEmail(
      leaseExpiryEmail({
        to: tenant.email!,
        tenantName: name,
        propertyAddress: address,
        daysUntilExpiry: days,
        leaseEndDate: end.toISOString().slice(0, 10),
        renewalUrl: 'https://agentloop-web-one.vercel.app/tenants',
      }),
    );
    if (res.ok) sent++;
    else failed++;
  }

  return NextResponse.json({ ok: true, scanned: rows.length, matched: toNotify.length, sent, failed });
}
