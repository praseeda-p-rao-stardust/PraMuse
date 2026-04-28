import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SkillLevel } from '@prisma/client';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.skill.findMany({
      include: { user: { select: { name: true, avatar: true, trust_score: true } } }
    });
  }

  async create(data: { user_id: string; title: string; description: string; category: string; level: SkillLevel; availability: string }) {
    return this.prisma.skill.create({ data });
  }

  async remove(id: string) {
    return this.prisma.skill.delete({ where: { id } });
  }
}
