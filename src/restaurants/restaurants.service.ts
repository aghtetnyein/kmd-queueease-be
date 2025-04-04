import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'libs/helpers/src';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { UpdateRestaurantOpenDaysDto } from './dto/update-restaurant-days.dto';
import { UpdateRestaurantOpenHoursDto } from './dto/update-restaurant-hours.dto';

@Injectable()
export class RestaurantService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllRestaurants({ search }: { search?: string }) {
    if (search) {
      return this.prisma.restaurant.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          location: true,
          slug: true,
          admin: {
            select: {
              id: true,
              name: true,
              phoneNo: true,
              email: true,
              profileImgUrl: true,
            },
          },
        },
      });
    }

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
        slug: data.name.toLowerCase().replace(/ /g, '-'),
        // TODO: Generate QR code and shared link
        location: '',
        qrCode: '',
        sharedLink: '',
        openDays: [1, 2, 3, 4, 5],
        openHour: '10:00',
        closeHour: '22:00',
        slotDurationInMin: 60,
        admin: {
          connect: {
            id: admin.id,
          },
        },
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

  async getRestaurantDetailsBySlug(slug: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { slug },
      include: {
        admin: true,
      },
    });

    if (!restaurant) {
      throw new HttpException('Restaurant not found', HttpStatus.NOT_FOUND);
    }

    const tables = await this.prisma.table.findMany({
      where: { restaurantId: restaurant.id },
    });

    if (tables.length === 0) {
      return {
        ...restaurant,
        setupProgress: 'INCOMPLETE',
      };
    }

    return {
      ...restaurant,
      setupProgress: 'COMPLETE',
    };
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

  updateRestaurantOpenDays(id: string, data: UpdateRestaurantOpenDaysDto) {
    return this.prisma.restaurant.update({
      where: { id },
      data: { openDays: data.openDays.map(Number) },
    });
  }

  updateRestaurantOpenHours(id: string, data: UpdateRestaurantOpenHoursDto) {
    return this.prisma.restaurant.update({
      where: { id },
      data: {
        openHour: data.openHour,
        closeHour: data.closeHour,
        slotDurationInMin: data.slotDurationInMin,
      },
    });
  }
}
