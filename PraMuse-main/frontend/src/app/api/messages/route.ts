import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/messages?swapId=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const swapId = searchParams.get('swapId');
    if (!swapId) return NextResponse.json({ error: 'swapId required' }, { status: 400 });

    const messages = await prisma.message.findMany({
      where: { swap_id: swapId },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
      orderBy: { sent_at: 'asc' },
    });
    return NextResponse.json(messages);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/messages — send a message
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = await prisma.message.create({
      data: {
        swap_id: body.swap_id,
        sender_id: body.sender_id,
        text: body.text,
      },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });
    return NextResponse.json(message);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
