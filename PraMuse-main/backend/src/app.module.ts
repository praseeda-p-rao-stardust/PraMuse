import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { SkillsModule } from './skills/skills.module';
import { SwapsModule } from './swaps/swaps.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [PrismaModule, UsersModule, SkillsModule, SwapsModule, ReviewsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
