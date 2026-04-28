import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/reviews — submit a review and recalculate trust score
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const review = await prisma.review.create({
      data: {
        reviewer_id: body.reviewer_id,
        reviewed_id: body.reviewed_id,
        rating: body.rating,
        feedback: body.feedback || '',
      },
    });

    // Recalculate trust score
    const allReviews = await prisma.review.findMany({ where: { reviewed_id: body.reviewed_id } });
    const avgScore = allReviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / allReviews.length;
    await prisma.user.update({
      where: { id: body.reviewed_id },
      data: { trust_score: Number(avgScore.toFixed(1)) },
    });

    return NextResponse.json(review);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
