import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { reviewer_id: string; reviewed_id: string; rating: number; feedback: string }) {
    // 1. Create the review
    const review = await this.prisma.review.create({ data });
    
    // 2. Update the user's trust score
    const userReviews = await this.prisma.review.findMany({ where: { reviewed_id: data.reviewed_id } });
    const averageScore = userReviews.reduce((acc, curr) => acc + curr.rating, 0) / userReviews.length;
    
    await this.prisma.user.update({
      where: { id: data.reviewed_id },
      data: { trust_score: averageScore }
    });

    return review;
  }
}
