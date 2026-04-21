// Supabase admin client (service_role). SERVER ONLY — never import from client code.
//
// Used for operations that need to bypass RLS: creating auth users, admin
// inserts, cross-tenant reads, migrations, etc.

import 'server-only';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdminConfigured = Boolean(url && serviceRoleKey);

let _client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (!url || !serviceRoleKey) {
    throw new Error(
      'supabaseAdmin(): NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set',
    );
  }
  if (!_client) {
    _client = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _client;
}
