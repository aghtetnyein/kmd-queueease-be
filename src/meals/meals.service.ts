import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/helpers/src';
import { Meal } from '@prisma/client';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@Injectable()
export class MealsService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllMeals({
    page = '1',
    page_size = '20',
    search,
  }: {
    page?: string;
    page_size?: string;
    search?: string;
  }) {
    const skip = (Number(page) - 1) * Number(page_size);

    let meals: Meal[];
    let total: number;

    if (search) {
      [meals, total] = await Promise.all([
        this.prisma.meal.findMany({
          where: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
            ],
          },
          skip,
          take: Number(page_size),
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.meal.count({
          where: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
            ],
          },
        }),
      ]);
    } else {
      [meals, total] = await Promise.all([
        this.prisma.meal.findMany({
          skip,
          take: Number(page_size),
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.meal.count(),
      ]);
    }

    return {
      data: meals,
      page_data: {
        total: Number(total),
        page: Number(page),
        page_size: Number(page_size),
        total_pages: Math.ceil(Number(total) / Number(page_size)),
        has_previous_page: Number(page) > 1,
        has_next_page:
          Number(page) < Math.ceil(Number(total) / Number(page_size)),
      },
    };
  }

  async createMeal(data: CreateMealDto) {
    return this.prisma.meal.create({
      data: {
        name: data.name,
        price: parseFloat(data.price),
        category: data.category,
        restaurantId: data.restaurantId,
      },
    });
  }

  async updateMeal(id: string, data: UpdateMealDto) {
    return this.prisma.meal.update({
      where: { id },
      data: {
        name: data.name,
        price: parseFloat(data.price),
        category: data.category,
      },
    });
  }

  async deleteMeal(id: string) {
    return this.prisma.meal.delete({
      where: { id },
    });
  }
}
