// Server-side Supabase auth helper. Validates the JWT from the
// Authorization: Bearer header and returns the authenticated user.
//
// Usage in API routes:
//   const user = await getAuthUser(req);
//   if (!user) return apiError(requestId, 'unauthenticated', 401);

import 'server-only';

import { supabaseAdmin, supabaseAdminConfigured } from '@/lib/supabase-admin';

export type AuthUser = {
  id: string;
  email?: string;
};

export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : undefined;

  if (!token) return null;
  if (!supabaseAdminConfigured) return null;

  try {
    const { data, error } = await supabaseAdmin().auth.getUser(token);
    if (error || !data.user) return null;
    return { id: data.user.id, email: data.user.email ?? undefined };
  } catch {
    return null;
  }
}
