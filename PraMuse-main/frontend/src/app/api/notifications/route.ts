import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/notifications?userId=xxx — unread counts for bell
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const [pendingRequests, activeSwaps] = await Promise.all([
      prisma.swapRequest.count({ where: { receiver_id: userId, status: 'PENDING' } }),
      prisma.swapRequest.count({ where: { OR: [{ sender_id: userId }, { receiver_id: userId }], status: 'ACCEPTED' } }),
    ]);

    return NextResponse.json({ pendingRequests, activeSwaps, total: pendingRequests });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
