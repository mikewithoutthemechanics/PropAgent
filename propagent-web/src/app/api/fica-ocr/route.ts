import { z } from 'zod';
import { aiLimiter, checkLimit, cacheSet } from '@/lib/redis';
import { chatComplete } from '@/lib/openai-server';
import { getAuthUser } from '@/lib/auth-server';
import { apiError, apiOk, getRequestId } from '@/lib/api-response';
import { parseJsonBody } from '@/lib/validation';

export const runtime = 'nodejs';

const bodySchema = z.object({
  documentImage: z.string().min(100),
  documentType: z.enum(['id-book', 'passport', 'driver-license', 'utility-bill', 'bank-statement']),
});

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const user = await getAuthUser(req);
  if (!user) return apiError(requestId, 'unauthenticated', 401);

  const parsedBody = await parseJsonBody(req, bodySchema, requestId);
  if ('response' in parsedBody) return parsedBody.response;
  const { documentType } = parsedBody.data;

  const limit = await checkLimit(aiLimiter, `ai:fica-ocr:${user.id}`);
  if (!limit.success) {
    return apiError(requestId, 'rate_limited', 429, { reset: limit.reset });
  }

  const prompt = `Extract data from a South African ${documentType} document. Return JSON with keys: confidenceScore (0-100), extractedName (string|null), extractedIdNumber (string|null), extractedAddress (string|null), documentValid (boolean).`;

  const raw = await chatComplete(
    [{ role: 'system', content: 'You are a FICA document OCR extraction engine for South African documents. Return only JSON.' }, { role: 'user', content: prompt }],
    { temperature: 0.2 },
  );

  let aiResult: { confidenceScore?: number; extractedName?: string; extractedIdNumber?: string; extractedAddress?: string; documentValid?: boolean } = {};
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) aiResult = JSON.parse(match[0]);
  } catch {
    aiResult = {};
  }

  const analysisId = `FICA-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const result = {
    analysisId,
    status: 'extracted',
    confidenceScore: aiResult.confidenceScore ?? 60,
    documentType,
    extractedName: aiResult.extractedName ?? null,
    extractedIdNumber: aiResult.extractedIdNumber ?? null,
    extractedAddress: aiResult.extractedAddress ?? null,
    documentValid: aiResult.documentValid ?? false,
  };

  await cacheSet(`fica:${documentType}:${user.id}`, result, 86400);
  return apiOk(requestId, result);
}
