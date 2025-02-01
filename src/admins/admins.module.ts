import { Module } from '@nestjs/common';
import { AdminService } from './admins.service';
import { AdminController } from './admins.controller';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminJwtStrategy } from './strategies/admins.jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    JwtService,
    ConfigService,
    AdminJwtStrategy,
    JwtAuthGuard,
  ],
})
export class AdminModule {}
