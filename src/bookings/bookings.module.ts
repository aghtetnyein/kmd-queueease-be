import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/admins/guards/jwt-auth.guard';

@Module({
  imports: [PrismaModule],
  controllers: [BookingsController],
  providers: [BookingsService, JwtService, ConfigService, JwtAuthGuard],
})
export class BookingsModule {}
