import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase-client';
import { redis } from '@/lib/redis';
import { aiChat } from '@/lib/ai-client';
import { z } from 'zod';

const PropertyMatchingSchema = z.object({
  buyerProfileId: z.string().min(1),
  propertyId: z.string().min(1)
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const body = await req.json();
    const validation = PropertyMatchingSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    const { data: property } = await supabase.from('properties').select('*').eq('id', body.propertyId).single();
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    const matchId = `MATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const response = await aiChat({
      messages: [{ role: 'system', content: 'Match buyers to properties.' },
      { role: 'user', content: `Match property: ${property.address}` }],
      temperature: 0.3,
      maxTokens: 2000
    });
    let aiResult;
    try {
      aiResult = JSON.parse(response.match(/\{[\s\S]*\}/)?.[0] || { overallScore: 70, compatibility: 'medium' });
    } catch {
      aiResult = { overallScore: 70, compatibility: 'medium' };
    }
    const result = {
      matchId,
      status: 'matched',
      overallScore: aiResult.overallScore || 70,
      compatibility: aiResult.compatibility || 'medium',
      primaryProperty: property,
      recommendedMatches: [],
      processingTime: Date.now() - performance.now()
    };
    await redis.setex(`match:${body.buyerProfileId}:${body.propertyId}`, 86400, JSON.stringify(result));
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Matching service unavailable' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';