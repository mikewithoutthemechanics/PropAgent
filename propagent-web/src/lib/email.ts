// Resend email service. Server-only.
//
// Configure via env:
//   RESEND_API_KEY
//   RESEND_FROM_EMAIL   (e.g. "Agent Loop <notifications@yourdomain.com>")
//
// Templates are inline React-free HTML so we don't need @react-email/components
// yet; we can swap to <Email /> components later without touching call sites.

import 'server-only';

import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Agent Loop <onboarding@resend.dev>';

export const emailConfigured = Boolean(apiKey);

const resend = apiKey ? new Resend(apiKey) : null;

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
};

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string; skipped?: boolean };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping send to', input.to);
    return { ok: false, error: 'RESEND_API_KEY not configured', skipped: true };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
      tags: input.tags,
    });
    if (error) {
      console.error('[email] resend error', error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id ?? 'unknown' };
  } catch (err) {
    console.error('[email] send threw', err);
    return { ok: false, error: err instanceof Error ? err.message : 'unknown error' };
  }
}

// -------- Template helpers --------

const brandColor = '#00beff'; // cyan accent from design system
const charcoal = '#111827';
const muted = '#6b7280';

function layout(title: string, bodyHtml: string, ctaHref?: string, ctaLabel?: string): string {
  const cta =
    ctaHref && ctaLabel
      ? `<p style="text-align:center;margin:32px 0 8px">
          <a href="${escapeHtml(ctaHref)}"
             style="display:inline-block;background:${brandColor};color:${charcoal};text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-family:system-ui,sans-serif;">
            ${escapeHtml(ctaLabel)}
          </a>
        </p>`
      : '';
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:${charcoal};">
    <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
      <div style="background:white;border-radius:16px;padding:32px;border:1px solid #e5e7eb;">
        <h1 style="margin:0 0 16px;font-size:22px;color:${charcoal};">${escapeHtml(title)}</h1>
        <div style="font-size:15px;line-height:1.6;color:${charcoal};">
          ${bodyHtml}
        </div>
        ${cta}
      </div>
      <p style="text-align:center;color:${muted};font-size:12px;margin-top:16px;">
        Sent by Agent Loop · <a href="https://propagent-web-one.vercel.app" style="color:${muted};">agentloop.ai</a>
      </p>
    </div>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---- Template: Welcome (new tenant / new agent) ----

export type WelcomeEmailInput = {
  to: string;
  recipientName: string;
  role: 'tenant' | 'agent';
  dashboardUrl?: string;
};

export function welcomeEmail({
  to,
  recipientName,
  role,
  dashboardUrl = 'https://propagent-web-one.vercel.app/dashboard',
}: WelcomeEmailInput): SendEmailInput {
  const body =
    role === 'agent'
      ? `<p>Hi ${escapeHtml(recipientName)},</p>
         <p>Welcome to Agent Loop. Your agent workspace is live — you can now manage properties, tenants, leads, and everything in between from one dashboard.</p>
         <p>Your next steps:</p>
         <ul>
           <li>Add your first property from the Properties tab</li>
           <li>Import or add your tenant list</li>
           <li>Connect listing syndication in Settings → Syndication</li>
         </ul>`
      : `<p>Hi ${escapeHtml(recipientName)},</p>
         <p>Your tenant portal is ready. You'll get updates here about maintenance, rent, lease renewals, and anything your property manager needs you to know.</p>
         <p>Sign in any time at the link below.</p>`;
  return {
    to,
    subject: role === 'agent' ? 'Welcome to Agent Loop' : 'Welcome to Agent Loop — your tenant portal is ready',
    html: layout(
      role === 'agent' ? 'Welcome to Agent Loop' : 'Welcome, ' + escapeHtml(recipientName),
      body,
      dashboardUrl,
      'Open dashboard',
    ),
    text:
      `Hi ${recipientName},\n\nWelcome to Agent Loop.\n\n` +
      `Open your dashboard: ${dashboardUrl}\n\n— Agent Loop`,
    tags: [
      { name: 'category', value: 'welcome' },
      { name: 'role', value: role },
    ],
  };
}

// ---- Template: Notification ----

export type NotificationEmailInput = {
  to: string;
  recipientName: string;
  notificationTitle: string;
  notificationBody: string;
  actionUrl?: string;
  actionLabel?: string;
};

export function notificationEmail({
  to,
  recipientName,
  notificationTitle,
  notificationBody,
  actionUrl,
  actionLabel,
}: NotificationEmailInput): SendEmailInput {
  const body = `<p>Hi ${escapeHtml(recipientName)},</p>
    <p>${escapeHtml(notificationBody)}</p>`;
  return {
    to,
    subject: notificationTitle,
    html: layout(notificationTitle, body, actionUrl, actionLabel ?? 'View in Agent Loop'),
    text: `${notificationTitle}\n\n${notificationBody}\n\n${actionUrl ?? ''}`,
    tags: [{ name: 'category', value: 'notification' }],
  };
}

// ---- Template: Lease expiry reminder ----

export type LeaseExpiryEmailInput = {
  to: string;
  tenantName: string;
  propertyAddress: string;
  daysUntilExpiry: number;
  leaseEndDate: string;
  renewalUrl?: string;
};

export function leaseExpiryEmail({
  to,
  tenantName,
  propertyAddress,
  daysUntilExpiry,
  leaseEndDate,
  renewalUrl,
}: LeaseExpiryEmailInput): SendEmailInput {
  const subject =
    daysUntilExpiry <= 0
      ? `Your lease at ${propertyAddress} has expired`
      : `Your lease at ${propertyAddress} expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`;
  const body = `<p>Hi ${escapeHtml(tenantName)},</p>
    <p>This is a reminder that your lease at <strong>${escapeHtml(propertyAddress)}</strong> ${
      daysUntilExpiry <= 0 ? 'expired' : 'expires'
    } on <strong>${escapeHtml(leaseEndDate)}</strong>.</p>
    <p>Reply to this email or contact your property manager to discuss renewal options.</p>`;
  return {
    to,
    subject,
    html: layout(subject, body, renewalUrl, renewalUrl ? 'Review renewal' : undefined),
    text: `${subject}\n\nLease end date: ${leaseEndDate}\n\n— Agent Loop`,
    tags: [
      { name: 'category', value: 'lease-expiry' },
      { name: 'days', value: String(daysUntilExpiry) },
    ],
  };
}

// ---- Template: Maintenance update ----

export type MaintenanceUpdateEmailInput = {
  to: string;
  tenantName: string;
  requestTitle: string;
  status: string;
  note?: string;
  portalUrl?: string;
};

export function maintenanceUpdateEmail({
  to,
  tenantName,
  requestTitle,
  status,
  note,
  portalUrl,
}: MaintenanceUpdateEmailInput): SendEmailInput {
  const subject = `Maintenance update: ${requestTitle}`;
  const body = `<p>Hi ${escapeHtml(tenantName)},</p>
    <p>Your maintenance request <strong>${escapeHtml(requestTitle)}</strong> is now <strong>${escapeHtml(status)}</strong>.</p>
    ${note ? `<p>${escapeHtml(note)}</p>` : ''}`;
  return {
    to,
    subject,
    html: layout(subject, body, portalUrl, portalUrl ? 'View request' : undefined),
    text: `Maintenance update — ${requestTitle}: ${status}${note ? '\n\n' + note : ''}`,
    tags: [
      { name: 'category', value: 'maintenance' },
      { name: 'status', value: status },
    ],
  };
}

// ---- Template: New lead assigned to agent ----

export type NewLeadEmailInput = {
  to: string;
  agentName: string;
  leadName: string;
  leadEmail?: string;
  leadPhone?: string;
  propertyAddress?: string;
  message?: string;
  leadsUrl?: string;
};

export function newLeadEmail({
  to,
  agentName,
  leadName,
  leadEmail,
  leadPhone,
  propertyAddress,
  message,
  leadsUrl = 'https://propagent-web-one.vercel.app/leads',
}: NewLeadEmailInput): SendEmailInput {
  const subject = `New lead: ${leadName}${propertyAddress ? ` — ${propertyAddress}` : ''}`;
  const body = `<p>Hi ${escapeHtml(agentName)},</p>
    <p>You have a new lead in Agent Loop:</p>
    <p>
      <strong>${escapeHtml(leadName)}</strong><br/>
      ${leadEmail ? `Email: <a href="mailto:${escapeHtml(leadEmail)}">${escapeHtml(leadEmail)}</a><br/>` : ''}
      ${leadPhone ? `Phone: ${escapeHtml(leadPhone)}<br/>` : ''}
      ${propertyAddress ? `Property: ${escapeHtml(propertyAddress)}` : ''}
    </p>
    ${message ? `<blockquote style="border-left:3px solid ${brandColor};padding-left:12px;color:${muted};">${escapeHtml(message)}</blockquote>` : ''}`;
  return {
    to,
    subject,
    html: layout(subject, body, leadsUrl, 'Open leads'),
    text: `New lead: ${leadName}${leadEmail ? ' · ' + leadEmail : ''}${leadPhone ? ' · ' + leadPhone : ''}`,
    tags: [{ name: 'category', value: 'lead' }],
  };
}
