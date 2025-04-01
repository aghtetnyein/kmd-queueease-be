import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/helpers/src';
import { Table, TableStatus } from '@prisma/client';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllTables({
    page = '1',
    page_size = '20',
    status,
    search,
  }: {
    page?: string;
    page_size?: string;
    status?: string;
    search?: string;
  }) {
    const skip = (Number(page) - 1) * Number(page_size);
    const statusFilter =
      status && status.toLowerCase() !== 'all'
        ? { status: { equals: status as TableStatus } }
        : {};

    let tables: Table[];
    let total: number;

    if (search) {
      [tables, total] = await Promise.all([
        this.prisma.table.findMany({
          where: {
            AND: [
              { tableNo: { contains: search, mode: 'insensitive' } },
              { ...statusFilter },
            ],
          },
          skip,
          take: Number(page_size),
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.table.count({
          where: {
            AND: [
              { tableNo: { contains: search, mode: 'insensitive' } },
              { ...statusFilter },
            ],
          },
        }),
      ]);
    } else {
      [tables, total] = await Promise.all([
        this.prisma.table.findMany({
          where: statusFilter,
          skip,
          take: Number(page_size),
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.table.count({
          where: statusFilter,
        }),
      ]);
    }

    return {
      data: tables,
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

  async addTable(data: CreateTableDto) {
    return this.prisma.table.create({
      data: {
        ...data,
        status: data.status as TableStatus,
        restaurantId: data.restaurantId,
      },
    });
  }

  async updateTable(id: string, data: UpdateTableDto) {
    return this.prisma.table.update({
      where: { id },
      data: {
        ...data,
        status: data.status as TableStatus,
      },
    });
  }

  async deleteTable(id: string) {
    return this.prisma.table.delete({
      where: { id },
    });
  }

  async getTableofLargestPartySize(restaurantId: string) {
    const table = await this.prisma.table.findFirst({
      where: { restaurantId },
      orderBy: { tableSize: 'desc' },
    });

    return table ? table : {};
  }
}
