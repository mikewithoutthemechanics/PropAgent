import { NextResponse } from 'next/server';
import { emailConfigured } from '@/lib/email';
import { redisConfigured } from '@/lib/redis';
import { openaiConfigured } from '@/lib/openai-server';
import { supabaseAdminConfigured } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    services: {
      supabaseAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAdmin: supabaseAdminConfigured,
      email: emailConfigured,
      redis: redisConfigured,
      groq: openaiConfigured,
    },
  });
}
