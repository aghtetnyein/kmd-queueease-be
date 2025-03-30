import { Module } from '@nestjs/common';
import { StaffsService } from './staffs.service';
import { StaffsController } from './staffs.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/admins/guards/jwt-auth.guard';

@Module({
  imports: [PrismaModule],
  controllers: [StaffsController],
  providers: [StaffsService, JwtService, ConfigService, JwtAuthGuard],
})
export class StaffsModule {}
