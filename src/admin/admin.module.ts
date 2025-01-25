import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaService } from 'libs/helpers/src';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminJwtStrategy } from './strategies/admin.jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    PrismaService,
    JwtService,
    ConfigService,
    AdminJwtStrategy,
    JwtAuthGuard,
  ],
})
export class AdminModule {}
