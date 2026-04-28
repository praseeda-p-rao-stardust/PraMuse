import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/:id — fetch public profile with skills and reviews
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        trust_score: true,
        email: true,
        created_at: true,
        skills: {
          orderBy: { created_at: 'desc' },
          select: { id: true, title: true, seeking: true, category: true, level: true, availability: true, created_at: true },
        },
        reviews_received: {
          orderBy: { created_at: 'desc' },
          take: 10,
          select: {
            id: true, rating: true, feedback: true, created_at: true,
            reviewer: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/users/:id — update profile (upsert so it never fails on missing user)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Use upsert — if user doesn't exist yet, create them
    const user = await prisma.user.upsert({
      where: { id },
      update: {
        name: body.name.trim(),
        avatar: body.avatar?.trim() || null,
      },
      create: {
        name: body.name.trim(),
        email: body.email || `${id}@pramuse.app`,
        avatar: body.avatar?.trim() || null,
        trust_score: 5.0,
      },
    });

    return NextResponse.json(user);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('PUT /api/users/[id] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
