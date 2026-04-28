import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/swaps/:id — update swap status
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    const swap = await prisma.swapRequest.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(swap);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
