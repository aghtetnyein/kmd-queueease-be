import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'libs/helpers/src';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  getAllRestaurants() {
    return this.prisma.restaurant.findMany();
  }

  createRestaurant(data: CreateRestaurantDto) {
    return this.prisma.restaurant.create({
      data: {
        name: data.name,
        location: data.location,
        qrCode: 'qrCode',
        sharedLink: 'sharedLink',
      },
    });
  }

  getRestaurantById(id: string) {
    return this.prisma.restaurant.findUnique({
      where: { id },
    });
  }
}
