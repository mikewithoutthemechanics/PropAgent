import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redis } from '@/lib/redis';
import { aiChat } from '@/lib/ai-client';
import { z } from 'zod';

const EmailIntentSchema = z.object({
  emailContent: z.string().min(10),
  intentType: z.enum(['enquiry', 'complaint', 'application', 'document-request', 'general']).optional()
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const body = await req.json();
    const validation = EmailIntentSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    const analysisId = `INT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const response = await aiChat({
      messages: [{ role: 'system', content: 'Classify email intent for property management.' },
      { role: 'user', content: body.emailContent.substring(0, 1000) }],
      temperature: 0.3,
      maxTokens: 1000
    });
    let aiResult;
    try {
      aiResult = JSON.parse(response.match(/\{[\s\S]*\}/)?.[0] || { intent: 'general' });
    } catch {
      aiResult = { intent: 'general', confidence: 60 };
    }
    const result = {
      analysisId,
      status: 'analyzed',
      confidence: aiResult.confidence || 70,
      intent: aiResult.intent || 'general',
      action: aiResult.action || 'review',
      processingTime: Date.now() - performance.now()
    };
    await redis.setex(`email-intent:${Date.now()}`, 3600, JSON.stringify(result));
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';