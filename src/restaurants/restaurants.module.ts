import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurants.service';
import { RestaurantController } from './restaurants.controller';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RestaurantController],
  providers: [RestaurantService, JwtService, ConfigService],
})
export class RestaurantModule {}
