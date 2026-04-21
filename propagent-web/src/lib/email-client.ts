// Client-safe helpers for triggering emails via our API routes.
// Fire-and-forget — errors are swallowed and logged; emails never block UI.

export function sendWelcomeEmail(input: {
  to: string;
  recipientName: string;
  role?: 'tenant' | 'agent';
  dashboardUrl?: string;
}): Promise<void> {
  return fireAndForget('/api/email/welcome', input);
}

export function sendNotificationEmail(input: {
  to: string;
  recipientName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}): Promise<void> {
  return fireAndForget('/api/email/notification', input);
}

export function sendLeaseExpiryEmail(input: {
  to: string;
  tenantName: string;
  propertyAddress: string;
  daysUntilExpiry: number;
  leaseEndDate: string;
  renewalUrl?: string;
}): Promise<void> {
  return fireAndForget('/api/email/lease-expiry', input);
}

async function fireAndForget(url: string, body: unknown): Promise<void> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.warn(`[email-client] ${url} -> ${res.status}`);
    }
  } catch (err) {
    console.warn(`[email-client] ${url} threw`, err);
  }
}
