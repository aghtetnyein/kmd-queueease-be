import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/helpers/src';
import { Staff } from '@prisma/client';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffsService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllStaffs({
    page = '1',
    page_size = '20',
    search,
  }: {
    page?: string;
    page_size?: string;
    search?: string;
  }) {
    const skip = (Number(page) - 1) * Number(page_size);

    let staffs: Staff[];
    let total: number;

    if (search) {
      [staffs, total] = await Promise.all([
        this.prisma.staff.findMany({
          where: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phoneNo: { contains: search, mode: 'insensitive' } },
              { role: { contains: search, mode: 'insensitive' } },
            ],
          },
          skip,
          take: Number(page_size),
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.staff.count({
          where: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phoneNo: { contains: search, mode: 'insensitive' } },
              { role: { contains: search, mode: 'insensitive' } },
            ],
          },
        }),
      ]);
    } else {
      [staffs, total] = await Promise.all([
        this.prisma.staff.findMany({
          skip,
          take: Number(page_size),
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.staff.count(),
      ]);
    }

    return {
      data: staffs,
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

  async createStaff(data: CreateStaffDto) {
    return this.prisma.staff.create({
      data: {
        ...data,
        restaurantId: data.restaurantId,
      },
    });
  }

  async updateStaff(id: string, data: UpdateStaffDto) {
    return this.prisma.staff.update({
      where: { id },
      data,
    });
  }

  async deleteStaff(id: string) {
    return this.prisma.staff.delete({
      where: { id },
    });
  }
}
