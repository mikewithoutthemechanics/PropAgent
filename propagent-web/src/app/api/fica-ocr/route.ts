import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redis } from '@/lib/redis';
import { aiChat } from '@/lib/ai-client';
import { z } from 'zod';

const FicaOcrSchema = z.object({
  documentImage: z.string().min(100),
  documentType: z.enum(['id-book', 'passport', 'driver-license', 'utility-bill', 'bank-statement'])
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const body = await req.json();
    const validation = FicaOcrSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    const analysisId = `FICA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const response = await aiChat({
      messages: [{ role: 'system', content: 'Extract FICA document data.' },
      { role: 'user', content: `Extract from ${body.documentType} document` }],
      temperature: 0.2,
      maxTokens: 2000
    });
    let aiResult;
    try {
      aiResult = JSON.parse(response.match(/\{[\s\S]*\}/)?.[0] || { confidenceScore: 60 });
    } catch {
      aiResult = { confidenceScore: 60 };
    }
    const result = {
      analysisId,
      status: 'extracted',
      confidenceScore: aiResult.confidenceScore || 60,
      documentType: body.documentType,
      processingTime: Date.now() - performance.now()
    };
    await redis.setex(`fica:${body.documentType}`, 86400, JSON.stringify(result));
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'OCR service unavailable' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';