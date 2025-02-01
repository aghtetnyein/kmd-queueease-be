import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'libs/helpers/src';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllRestaurants() {
    return this.prisma.restaurant.findMany({
      include: {
        admin: true,
      },
    });
  }

  async createRestaurant(data: CreateRestaurantDto) {
    const admin = await this.prisma.admin.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    }

    const existingRestaurant = await this.prisma.restaurant.findFirst({
      where: {
        adminId: admin.id,
      },
    });

    if (existingRestaurant) {
      throw new HttpException(
        `Admin already has a restaurant`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const restaurant = await this.prisma.restaurant.create({
      data: {
        name: data.name,
        location: data.location,
        qrCode: 'qrCode',
        sharedLink: 'sharedLink',
        adminId: admin.id,
      },
      include: {
        admin: true,
      },
    });

    return restaurant;
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
