import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
  BadRequestException,
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

  async getAllQueuesForHomePage({
    day,
    restaurantId,
    queueType,
    isForToday,
  }: {
    day: string;
    restaurantId: string;
    queueType?: QueueStatus;
    isForToday?: boolean;
  }) {
    const timeSlotCompareLogic = isForToday
      ? queueType === 'BOOKING'
        ? {
            timeSlot: {
              gte: startOfDay(day),
              lte: endOfDay(day),
            },
          }
        : {
            updatedAt: {
              gte: startOfDay(day),
              lte: endOfDay(day),
            },
          }
      : {
          timeSlot: {
            gte: startOfDay(day),
            lte: endOfDay(day),
          },
        };

    const queues = await this.prisma.queue.findMany({
      where: {
        restaurantId,
        ...timeSlotCompareLogic,
        ...(queueType && { status: queueType }),
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        table: true,
        customer: true,
      },
    });

    return queues;
  }

  async getAllQueuesByRestaurantIdAndDay({
    restaurantId,
    timeSlotCompareLogic,
    queueType,
    isForCustomerBooking = false,
  }: {
    restaurantId: string;
    timeSlotCompareLogic?: any;
    queueType?: QueueStatus;
    isForCustomerBooking?: boolean;
  }) {
    // Get all tables for this restaurant
    const allTables = await this.prisma.table.findMany({
      where: { restaurantId },
    });

    const queues = await this.prisma.queue.findMany({
      where: {
        ...(timeSlotCompareLogic && {
          timeSlot: timeSlotCompareLogic,
        }),
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
        if (queue.tableStatus === 'RESERVED') {
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

  async getWaitlistByRestaurantIdAndDay({
    day,
    restaurantId,
  }: {
    day: string;
    restaurantId: string;
  }) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    const availableTableCount = await this.prisma.table.count({
      where: {
        restaurantId,
        status: 'AVAILABLE',
      },
    });
    const waitlistCount = await this.prisma.queue.count({
      where: {
        restaurantId,
        status: 'WAITLIST',
        updatedAt: {
          gte: startOfDay(day),
          lte: endOfDay(day),
        },
      },
    });
    const totalCount =
      waitlistCount + 1 - availableTableCount < 0
        ? 0
        : waitlistCount + 1 - availableTableCount;
    const estimatedWaitTime = totalCount * restaurant.slotDurationInMin;

    return {
      waitlistCount: totalCount,
      estimatedWaitTime: Math.max(estimatedWaitTime, 1),
    };
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
    } else {
      await this.prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: data.name,
        },
      });
    }

    // Generate and check queue number
    let queueNo: string;
    let existingQueue: any;
    do {
      const firstLetter = String.fromCharCode(
        65 + Math.floor(Math.random() * 26),
      ); // A-Z
      const secondLetter = String.fromCharCode(
        65 + Math.floor(Math.random() * 26),
      ); // A-Z
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      queueNo = `${firstLetter}${secondLetter}-${day}${hours}`;

      // Check if queue number already exists
      existingQueue = await this.prisma.queue.findUnique({
        where: { queueNo },
      });
    } while (existingQueue);

    if (data.queueType === 'WAITLIST') {
      const lastQueue = await this.prisma.queue.findFirst({
        where: {
          restaurantId: data.restaurantId,
          status: 'WAITLIST',
        },
        orderBy: { position: 'desc' },
      });

      const queue = await this.prisma.queue.create({
        data: {
          restaurantId: data.restaurantId,
          customerId: customer.id,
          partySize: Number(data.partySize),
          timeSlot: null,
          status: data.queueType,
          progressStatus: 'CONFIRMED',
          tableId: null,
          tableStatus: null,
          queueNo: queueNo,
          position: lastQueue ? lastQueue.position + 1 : 1,
        },
      });

      return queue;
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

    if (queue.status === 'WAITLIST') {
      const availableTableCount = await this.prisma.table.count({
        where: {
          restaurantId: queue.restaurantId,
          status: 'AVAILABLE',
        },
      });
      const waitlistCount = await this.prisma.queue.count({
        where: {
          restaurantId: queue.restaurantId,
          queueNo: {
            not: queue.queueNo,
          },
          status: 'WAITLIST',
          updatedAt: {
            lte: queue.updatedAt,
          },
        },
      });
      const totalCount =
        waitlistCount + 1 - availableTableCount < 0
          ? 0
          : waitlistCount + 1 - availableTableCount;
      const estimatedWaitTime = totalCount * queue.restaurant.slotDurationInMin;

      return {
        ...queue,
        waitlistCount: totalCount,
        estimatedWaitTime,
      };
    }

    if (queue.status === 'SERVING') {
      throw new BadRequestException('Queue is already serving');
    }

    return queue;
  }

  async updateQueueStatuses({
    id,
    tableId,
    status,
    progressStatus,
  }: {
    id: string;
    tableId: string;
    status: QueueStatus;
    progressStatus: QueueProgressStatus;
  }) {
    const queue = await this.prisma.queue.update({
      where: { id },
      data: {
        ...(tableId && { tableId }),
        ...(status && { status: status as QueueStatus }),
        ...(progressStatus && {
          progressStatus: progressStatus as QueueProgressStatus,
        }),
      },
    });

    if (status === 'SERVING') {
      await this.prisma.table.update({
        where: { id: tableId },
        data: { status: 'RESERVED' },
      });
    }

    if (status === 'COMPLETED') {
      await this.prisma.table.update({
        where: { id: queue.tableId },
        data: { status: 'AVAILABLE' },
      });
    }

    return queue;
  }
}
