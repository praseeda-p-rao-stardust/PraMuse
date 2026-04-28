import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/skills — fetch all skills with user info
export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, trust_score: true },
        },
      },
    });
    return NextResponse.json(skills);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/skills — publish a new skill
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const skill = await prisma.skill.create({
      data: {
        user_id: body.user_id,
        title: body.offering,
        description: body.description || '',
        category: body.category,
        level: body.level?.toUpperCase() || 'BEGINNER',
        seeking: body.seeking || '',
        availability: body.availability || '',
      },
      include: {
        user: { select: { id: true, name: true, avatar: true, trust_score: true } },
      },
    });
    return NextResponse.json(skill);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
