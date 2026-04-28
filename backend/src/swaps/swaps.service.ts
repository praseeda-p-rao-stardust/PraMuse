import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SwapsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.swapRequest.findMany({
      where: { OR: [{ sender_id: userId }, { receiver_id: userId }] },
      include: { sender: true, receiver: true, offered_skill: true, requested_skill: true }
    });
  }

  async create(data: { sender_id: string; receiver_id: string; offered_skill_id: string; requested_skill_id: string }) {
    return this.prisma.swapRequest.create({ data });
  }

  async updateStatus(id: string, status: "ACCEPTED" | "REJECTED" | "COMPLETED") {
    return this.prisma.swapRequest.update({
      where: { id },
      data: { status }
    });
  }
}
