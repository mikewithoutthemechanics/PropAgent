import { z } from 'zod';
import { aiLimiter, checkLimit, cacheSet } from '@/lib/redis';
import { chatComplete } from '@/lib/openai-server';
import { getAuthUser } from '@/lib/auth-server';
import { supabaseAdmin, supabaseAdminConfigured } from '@/lib/supabase-admin';
import { apiError, apiOk, getRequestId } from '@/lib/api-response';
import { parseJsonBody } from '@/lib/validation';

export const runtime = 'nodejs';

const bodySchema = z.object({
  buyerProfileId: z.string().min(1),
  propertyId: z.string().min(1),
});

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const user = await getAuthUser(req);
  if (!user) return apiError(requestId, 'unauthenticated', 401);

  const parsedBody = await parseJsonBody(req, bodySchema, requestId);
  if ('response' in parsedBody) return parsedBody.response;
  const { buyerProfileId, propertyId } = parsedBody.data;

  const limit = await checkLimit(aiLimiter, `ai:matching:${user.id}`);
  if (!limit.success) {
    return apiError(requestId, 'rate_limited', 429, { reset: limit.reset });
  }

  if (!supabaseAdminConfigured) {
    return apiError(requestId, 'supabase_not_configured', 503);
  }

  const admin = supabaseAdmin();
  const { data: property, error } = await admin
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .maybeSingle();

  if (error || !property) {
    return apiError(requestId, 'property_not_found', 404);
  }

  const prompt = `Match this property with a buyer and return JSON with keys: overallScore (0-100), compatibility ("low"|"medium"|"high"), reasons (string[]).

Property:
- Address: ${property.address ?? 'N/A'}
- Suburb: ${property.suburb ?? 'N/A'}, ${property.city ?? 'N/A'}
- Bedrooms: ${property.bedrooms ?? 'N/A'}
- Price: ZAR ${property.monthly_rent ?? property.sale_price ?? 'N/A'}`;

  const raw = await chatComplete(
    [{ role: 'system', content: 'You are a South African property matching engine. Return only JSON.' }, { role: 'user', content: prompt }],
    { temperature: 0.3 },
  );

  let aiResult: { overallScore?: number; compatibility?: string; reasons?: string[] } = {};
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) aiResult = JSON.parse(match[0]);
  } catch {
    aiResult = {};
  }

  const matchId = `MATCH-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const result = {
    matchId,
    status: 'matched',
    overallScore: aiResult.overallScore ?? 70,
    compatibility: aiResult.compatibility ?? 'medium',
    reasons: aiResult.reasons ?? [],
  };

  await cacheSet(`match:${buyerProfileId}:${propertyId}`, result, 86400);
  return apiOk(requestId, result);
}
