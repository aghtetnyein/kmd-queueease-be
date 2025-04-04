import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from 'libs/helpers/src';
import { startOfDay, endOfDay } from 'date-fns';
import { CreateQueueDto } from './dto/create-queue.dto';
import { TablesService } from 'src/tables/tables.service';
import { QueueProgressStatus, QueueStatus } from '@prisma/client';

@Injectable()
export class QueueService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => TablesService))
    private readonly tablesService: TablesService,
  ) {}

  async getAllQueuesByRestaurantIdAndDay({
    day,
    restaurantId,
    compareLogic,
    queueType,
    isForCustomerBooking = false,
  }: {
    day: string;
    restaurantId: string;
    compareLogic: 'equals' | 'between';
    queueType?: QueueStatus;
    isForCustomerBooking?: boolean;
  }) {
    const timeSlotCompareLogic =
      compareLogic === 'between'
        ? {
            gte: startOfDay(day),
            lte: endOfDay(day),
          }
        : {
            equals: new Date(day).toISOString(),
          };

    // Get all tables for this restaurant
    const allTables = await this.prisma.table.findMany({
      where: { restaurantId },
    });

    const queues = await this.prisma.queue.findMany({
      where: {
        timeSlot: timeSlotCompareLogic,
        ...(queueType && { status: queueType }),
        ...(isForCustomerBooking.toString() === 'true' && {
          status: {
            not: 'COMPLETED',
          },
        }),
        restaurantId,
      },
      include: {
        customer: true,
        table: true,
      },
      orderBy: {
        timeSlot: 'asc',
      },
    });

    // Group queues by timeslot
    const groupedQueues = queues.reduce(
      (acc, queue) => {
        const timeSlot = queue.timeSlot.toISOString();
        if (!acc[timeSlot]) {
          acc[timeSlot] = {
            queues: [],
            availableTables: [...allTables], // Start with all tables
            availableTableCount: allTables.length,
          };
        }

        // Add queue to the timeslot
        acc[timeSlot].queues.push(queue);

        // Remove occupied tables from available tables
        if (
          queue.tableStatus === 'OCCUPIED' ||
          queue.tableStatus === 'RESERVED'
        ) {
          acc[timeSlot].availableTables = acc[timeSlot].availableTables.filter(
            (table) => table.id !== queue.tableId,
          );
          acc[timeSlot].availableTableCount =
            acc[timeSlot].availableTables.length;
        }

        return acc;
      },
      {} as Record<
        string,
        {
          queues: typeof queues;
          availableTables: typeof allTables;
          availableTableCount: number;
        }
      >,
    );

    return groupedQueues;
  }

  async createQueue(data: CreateQueueDto) {
    let customer = await this.prisma.customer.findUnique({
      where: { phoneNo: data.phoneNo },
    });

    if (!customer) {
      // Create new customer if not found
      customer = await this.prisma.customer.create({
        data: {
          phoneNo: data.phoneNo,
          name: data.name,
        },
      });
    }

    // Apply the time from selectedSlot to the selected date
    const timeSlot = new Date(data.selectedSlot);
    const partySize = Number(data.partySize);

    // Find available tables that can accommodate the party size
    const availableTable =
      await this.tablesService.getNearestPartySizeAvailableTable(
        data.restaurantId,
        timeSlot.toISOString(),
        partySize,
      );

    if (!availableTable) {
      throw new NotFoundException(
        'No available tables found for the specified party size',
      );
    }

    // Generate queueNo
    const month = (timeSlot.getMonth() + 1).toString().padStart(2, '0');
    const day = timeSlot.getDate().toString().padStart(2, '0');
    const hours = timeSlot.getHours().toString().padStart(2, '0');
    const minutes = timeSlot.getMinutes().toString().padStart(2, '0');
    const queueNo = `${availableTable.tableNo}-${month}${day}-${hours}${minutes}`;

    const queue = await this.prisma.queue.create({
      data: {
        restaurantId: data.restaurantId,
        customerId: customer.id,
        partySize: partySize,
        timeSlot: timeSlot,
        status: data.queueType,
        progressStatus: 'CONFIRMED',
        tableId: availableTable.id,
        tableStatus: 'RESERVED',
        queueNo: queueNo,
      },
    });

    return queue;
  }

  async getQueueById(id: string) {
    const queue = await this.prisma.queue.findUnique({
      where: { id },
      include: {
        table: true,
        customer: true,
        restaurant: true,
      },
    });

    if (!queue) {
      throw new NotFoundException('Queue not found');
    }

    return queue;
  }

  async updateQueueStatuses(
    id: string,
    status?: string,
    progressStatus?: string,
  ) {
    const queue = await this.prisma.queue.update({
      where: { id },
      data: {
        status: status as QueueStatus,
        progressStatus: progressStatus as QueueProgressStatus,
      },
    });

    return queue;
  }
}
