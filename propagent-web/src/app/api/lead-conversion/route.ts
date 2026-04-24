import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redis } from '@/lib/redis';
import { aiChat } from '@/lib/ai-client';
import { z } from 'zod';

const LeadConversionSchema = z.object({
  leadId: z.string().min(1),
  leadData: z.object({
    email: z.string().email(),
    interestLevel: z.enum(['low', 'medium', 'high'])
  })
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const body = await req.json();
    const validation = LeadConversionSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    const conversionId = `CNV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const response = await aiChat({
      messages: [{ role: 'system', content: 'Predict lead conversion probability.' },
      { role: 'user', content: `Lead: ${body.leadId}` }],
      temperature: 0.3,
      maxTokens: 1000
    });
    let aiResult;
    try {
      aiResult = JSON.parse(response.match(/\{[\s\S]*\}/)?.[0] || { conversionProbability: 30 });
    } catch {
      aiResult = { conversionProbability: 30 };
    }
    const result = {
      conversionId,
      status: 'converted',
      probability: aiResult.conversionProbability || 30,
      action: aiResult.action || 'nurture',
      processingTime: Date.now() - performance.now()
    };
    await redis.setex(`conversion:${body.leadId}`, 3600, JSON.stringify(result));
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Conversion service unavailable' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';