import { Module } from '@nestjs/common';
import { AdminService } from './admins.service';
import { AdminController } from './admins.controller';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminJwtStrategy } from './strategies/admins.jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RestaurantService } from 'src/restaurants/restaurants.service';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    RestaurantService,
    JwtService,
    ConfigService,
    AdminJwtStrategy,
    JwtAuthGuard,
  ],
})
export class AdminModule {}
