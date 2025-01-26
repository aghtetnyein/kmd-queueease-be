import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurants.service';
import { RestaurantController } from './restaurants.controller';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'libs/helpers/src';

@Module({
  controllers: [RestaurantController],
  providers: [RestaurantService, PrismaService, JwtService, ConfigService],
})
export class RestaurantModule {}
