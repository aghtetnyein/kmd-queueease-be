import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from 'libs/helpers/src';
import { Table, TableStatus } from '@prisma/client';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { BookingsService } from 'src/bookings/bookings.service';
import { parse } from 'date-fns';
@Injectable()
export class TablesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => BookingsService))
    private readonly bookingsService: BookingsService,
  ) {}
  async getAllTables({
    page = '1',
    page_size = '20',
    search,
  }: {
    page?: string;
    page_size?: string;
    status?: string;
    search?: string;
  }) {
    const skip = (Number(page) - 1) * Number(page_size);

    let tables: Table[];
    let total: number;

    if (search) {
      [tables, total] = await Promise.all([
        this.prisma.table.findMany({
          where: {
            AND: [{ tableNo: { contains: search, mode: 'insensitive' } }],
          },
          skip,
          take: Number(page_size),
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.table.count({
          where: {
            AND: [{ tableNo: { contains: search, mode: 'insensitive' } }],
          },
        }),
      ]);
    } else {
      [tables, total] = await Promise.all([
        this.prisma.table.findMany({
          skip,
          take: Number(page_size),
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.table.count({}),
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

  async getAllTablesForTimeSlot(
    restaurantId: string,
    timeSlot: string,
    status?: TableStatus,
  ) {
    const queueTables = await this.prisma.tableQueue.findMany({
      where: {
        table: {
          restaurantId,
        },
        ...(status && { status }),
        // queue: {
        //   timeSlot: {
        //     equals: new Date(timeSlot),
        //   },
        // },
      },
      orderBy: {
        table: {
          tableSize: 'asc',
        },
      },
    });
    console.log(queueTables);
    return queueTables;
  }

  async addTable(data: CreateTableDto) {
    return this.prisma.table.create({
      data: data,
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

  async getNearestPartySizeAvailableTable(
    restaurantId: string,
    timeSlot: string,
    partySize: number,
  ) {
    const allTables = await this.prisma.table.findMany({
      where: { restaurantId },
    });

    const table = allTables.find((table) => table.tableSize >= partySize);

    const bookings =
      await this.bookingsService.getAllBookingsByRestaurantIdAndDay(
        timeSlot,
        restaurantId,
        'equals',
      );

    if (!bookings[`${timeSlot}`]) {
      return table;
    }

    const nearestTable = bookings[`${timeSlot}`].availableTables.find(
      (table) => table.tableSize >= partySize,
    );

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

    const bookings =
      await this.bookingsService.getAllBookingsByRestaurantIdAndDay(
        timeSlot,
        restaurantId,
        'equals',
      );

    if (!bookings[`${timeSlot}`]) {
      return { availableTableSize: table.tableSize };
    }

    const largestAvailableTable = bookings[`${timeSlot}`].availableTables.sort(
      (a, b) => b.tableSize - a.tableSize,
    )[0];

    return { availableTableSize: largestAvailableTable.tableSize };
  }
}
