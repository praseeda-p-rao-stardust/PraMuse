import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/swaps?userId=xxx — fetch all swap requests for a user
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const swaps = await prisma.swapRequest.findMany({
      where: { OR: [{ sender_id: userId }, { receiver_id: userId }] },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
        offered_skill: true,
        requested_skill: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json(swaps);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/swaps — create a new swap request
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const swap = await prisma.swapRequest.create({
      data: {
        sender_id: body.sender_id,
        receiver_id: body.receiver_id,
        offered_skill_id: body.offered_skill_id,
        requested_skill_id: body.requested_skill_id,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        offered_skill: true,
      },
    });
    return NextResponse.json(swap);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
