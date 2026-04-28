import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: { name: string; email: string; password_hash: string }) {
    return this.prisma.user.create({ data });
  }

  async loginOrRegister(email: string, name: string) {
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { 
          email, 
          name, 
          password_hash: 'auth_v2_pending', 
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=43302E&color=FFF1B5&bold=true` 
        }
      });
    }
    return user;
  }
}
