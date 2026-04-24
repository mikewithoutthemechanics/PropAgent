import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redis } from '@/lib/redis';
import { aiChat } from '@/lib/ai-client';
import { z } from 'zod';

const RentReminderSchema = z.object({
  tenantId: z.string().min(1),
  propertyId: z.string().min(1),
  rentAmount: z.number().positive(),
  dueDate: z.string()
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const body = await req.json();
    const validation = RentReminderSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    const reminderId = `RENT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const response = await aiChat({
      messages: [{ role: 'system', content: 'Generate South African rent reminder.' },
      { role: 'user', content: `Rent: ZAR ${body.rentAmount}, Due: ${body.dueDate}` }],
      temperature: 0.4,
      maxTokens: 1000
    });
    let aiResult;
    try {
      aiResult = JSON.parse(response.match(/\{[\s\S]*\}/)?.[0] || { message: 'Please pay rent' });
    } catch {
      aiResult = { message: 'Please pay your rent' };
    }
    const result = {
      reminderId,
      status: 'generated',
      tenantId: body.tenantId,
      urgencyLevel: aiResult.urgencyLevel || 'medium',
      message: aiResult.message || 'Rent payment reminder',
      sendVia: ['email', 'sms'],
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      processingTime: Date.now() - performance.now()
    };
    await redis.setex(`rent-reminder:${body.tenantId}`, 86400, JSON.stringify(result));
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';