import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from 'libs/helpers/src';
import { Table, TableStatus } from '@prisma/client';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { QueueService } from 'src/queues/queue.service';
import { endOfDay } from 'date-fns';
import { startOfDay } from 'date-fns';
@Injectable()
export class TablesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => QueueService))
    private readonly queueService: QueueService,
  ) {}
  async getAllTables({
    restaurant_id,
    page = '1',
    page_size = '20',
    status,
    search,
  }: {
    restaurant_id: string;
    page?: string;
    page_size?: string;
    status?: TableStatus;
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
              { restaurantId: restaurant_id },
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
              { restaurantId: restaurant_id },
              { tableNo: { contains: search, mode: 'insensitive' } },
              { ...statusFilter },
            ],
          },
        }),
      ]);
    } else {
      [tables, total] = await Promise.all([
        this.prisma.table.findMany({
          where: {
            restaurantId: restaurant_id,
            ...statusFilter,
          },
          skip,
          take: Number(page_size),
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.table.count({
          where: {
            restaurantId: restaurant_id,
            ...statusFilter,
          },
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
      data: { ...data, status: 'AVAILABLE' },
    });
  }

  async updateTable(id: string, data: UpdateTableDto) {
    return this.prisma.table.update({
      where: { id },
      data: data,
    });
  }

  async deleteTable(id: string) {
    return this.prisma.table.delete({
      where: { id },
    });
  }

  async getAllAvailableTablesForToday(restaurantId: string) {
    const today = new Date();

    const allTables = await this.prisma.table.findMany({
      where: { restaurantId, status: 'AVAILABLE' },
    });

    const tables = allTables.sort((a, b) => a.tableSize - b.tableSize);

    const bookings = await this.queueService.getAllQueuesByRestaurantIdAndDay({
      restaurantId,
      queueType: 'SERVING',
      timeSlotCompareLogic: {
        gte: startOfDay(today),
        lte: endOfDay(today),
      },
    });

    console.log(bookings);

    if (!bookings[`${today.toISOString()}`]) {
      return tables;
    }

    const availableTables = bookings[`${today.toISOString()}`].availableTables;

    return availableTables;
  }

  async getNearestPartySizeAvailableTable(
    restaurantId: string,
    timeSlot: string,
    partySize: number,
  ) {
    const allTables = await this.prisma.table.findMany({
      where: { restaurantId },
    });

    const table = allTables
      .filter((table) => table.tableSize >= partySize)
      .sort((a, b) => a.tableSize - b.tableSize)[0];

    const bookings = await this.queueService.getAllQueuesByRestaurantIdAndDay({
      restaurantId,
      timeSlotCompareLogic: {
        equals: new Date(timeSlot).toISOString(),
      },
      isForCustomerBooking: true,
    });

    if (!bookings[`${timeSlot}`]) {
      return table;
    }

    const nearestTable = bookings[`${timeSlot}`].availableTables
      .filter((table) => table.tableSize >= partySize)
      .sort((a, b) => a.tableSize - b.tableSize)[0];

    return nearestTable;
  }

  async getTableofLargestPartySizeAvailable(
    restaurantId: string,
    timeSlot: string,
  ) {
    const table = await this.prisma.table.findFirst({
      where: { restaurantId },
      orderBy: { tableSize: 'desc' },
    });

    const bookings = await this.queueService.getAllQueuesByRestaurantIdAndDay({
      restaurantId,
      timeSlotCompareLogic: {
        equals: new Date(timeSlot).toISOString(),
      },
      isForCustomerBooking: true,
    });

    if (!bookings[`${timeSlot}`]) {
      return { availableTableSize: table.tableSize };
    }

    console.log(bookings[`${timeSlot}`].availableTables);
    const largestAvailableTable = bookings[`${timeSlot}`].availableTables.sort(
      (a, b) => b.tableSize - a.tableSize,
    )[0];

    return { availableTableSize: largestAvailableTable.tableSize };
  }
}
