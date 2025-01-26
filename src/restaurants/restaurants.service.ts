import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/helpers/src';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(private readonly prisma: PrismaService) {}

  getAllRestaurants() {
    return this.prisma.restaurant.findMany();
  }

  async createRestaurant(data: CreateRestaurantDto) {
    const admin = await this.prisma.admin.findUnique({
      where: {
        email: 'admin@queueease.com',
      },
    });

    return this.prisma.restaurant.create({
      data: {
        name: data.name,
        location: data.location,
        qrCode: 'qrCode',
        sharedLink: 'sharedLink',
        admin: {
          connect: {
            id: admin.id,
          },
        },
      },
    });
  }

  getRestaurantById(id: string) {
    return this.prisma.restaurant.findUnique({
      where: { id },
    });
  }

  updateRestaurant(id: string, data: UpdateRestaurantDto) {
    return this.prisma.restaurant.update({
      where: { id },
      data,
    });
  }

  deleteRestaurant(id: string) {
    return this.prisma.restaurant.delete({
      where: { id },
    });
  }
}
