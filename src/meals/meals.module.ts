import { Module } from '@nestjs/common';
import { MealsService } from './meals.service';
import { MealsController } from './meals.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/admins/guards/jwt-auth.guard';

@Module({
  imports: [PrismaModule],
  controllers: [MealsController],
  providers: [MealsService, JwtService, ConfigService, JwtAuthGuard],
})
export class MealsModule {}
