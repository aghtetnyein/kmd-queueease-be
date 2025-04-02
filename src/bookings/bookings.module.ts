import { Module, forwardRef } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/admins/guards/jwt-auth.guard';
import { TablesModule } from 'src/tables/tables.module';

@Module({
  imports: [PrismaModule, forwardRef(() => TablesModule)],
  controllers: [BookingsController],
  providers: [BookingsService, JwtService, ConfigService, JwtAuthGuard],
  exports: [BookingsService],
})
export class BookingsModule {}
