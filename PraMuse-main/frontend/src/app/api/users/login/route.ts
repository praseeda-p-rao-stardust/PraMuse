import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();
    if (!email || !name) return NextResponse.json({ error: 'email and name required' }, { status: 400 });

    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: {
        email,
        name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=43302E&color=FFF1B5&bold=true`,
        trust_score: 5.0,
      },
    });

    return NextResponse.json(user);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('Login error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
