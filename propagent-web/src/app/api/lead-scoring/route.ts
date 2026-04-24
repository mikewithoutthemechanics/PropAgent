import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redis } from '@/lib/redis';
import { aiChat } from '@/lib/ai-client';
import { z } from 'zod';

const LeadScoringSchema = z.object({
  leadData: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phoneNumber: z.string().min(10),
    creditScore: z.number().min(300).max(850).optional(),
    income: z.number().positive().optional(),
    employmentStatus: z.enum(['employed', 'self-employed', 'unemployed', 'retired']),
    propertyType: z.enum(['residential', 'commercial', 'investment']),
    loanAmount: z.number().positive(),
    loanPurpose: z.enum(['purchase', 'refinance', 'home-improvement'])
  })
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const body = await req.json();
    const validation = LeadScoringSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    const leadId = `LEAD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const aiResponse = await aiChat({
      messages: [{ role: 'system', content: 'Analyze lead data and assign risk score (0-100).' },
      { role: 'user', content: `Score lead: ${body.leadData.fullName}` }],
      temperature: 0.4,
      maxTokens: 2000
    });
    let aiResult;
    try { aiResult = JSON.parse(aiResponse.match(/\{[\s\S]*\}/)?.[0] || { riskScore: 50 }); } catch { aiResult = { riskScore: 50 }; }
    const result = {
      leadId,
      status: 'scored',
      confidenceScore: 70,
      riskScore: aiResult.riskScore || 50,
      riskCategory: aiResult.riskCategory || 'acceptable',
      processingTime: Date.now() - performance.now()
    };
    await redis.setex(`lead-score:${body.leadData.email}`, 3600, JSON.stringify(result));
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';