import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from 'libs/helpers/src';
import { parse, startOfDay, endOfDay } from 'date-fns';
import { CreateBookingDto } from './dto/create-booking.dto';
import { TablesService } from 'src/tables/tables.service';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => TablesService))
    private readonly tablesService: TablesService,
  ) {}

  async getAllBookingsByRestaurantIdAndDay(
    day: string,
    restaurantId: string,
    compareLogic: 'equals' | 'between',
  ) {
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

    const bookings = await this.prisma.queue.findMany({
      where: {
        timeSlot: timeSlotCompareLogic,
        status: 'BOOKING',
        restaurantId,
      },
      include: {
        customer: true,
        tableQueues: {
          include: {
            table: true,
          },
        },
      },
      orderBy: {
        timeSlot: 'asc',
      },
    });

    // Group bookings by timeslot
    const groupedBookings = bookings.reduce(
      (acc, booking) => {
        const timeSlot = booking.timeSlot.toISOString();
        if (!acc[timeSlot]) {
          acc[timeSlot] = {
            bookings: [],
            availableTables: [...allTables], // Start with all tables
            availableTableCount: allTables.length,
          };
        }

        // Add booking to the timeslot
        acc[timeSlot].bookings.push(booking);

        // Remove occupied tables from available tables
        booking.tableQueues.forEach((tableQueue) => {
          if (
            tableQueue.status === 'OCCUPIED' ||
            tableQueue.status === 'RESERVED'
          ) {
            acc[timeSlot].availableTables = acc[
              timeSlot
            ].availableTables.filter(
              (table) => table.id !== tableQueue.table.id,
            );
            acc[timeSlot].availableTableCount =
              acc[timeSlot].availableTables.length;
          }
        });

        return acc;
      },
      {} as Record<
        string,
        {
          bookings: typeof bookings;
          availableTables: typeof allTables;
          availableTableCount: number;
        }
      >,
    );

    return groupedBookings;
  }

  async createBooking(data: CreateBookingDto) {
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

    const booking = await this.prisma.queue.create({
      data: {
        restaurantId: data.restaurantId,
        customerId: customer.id,
        partySize: partySize,
        timeSlot: timeSlot,
        status: 'BOOKING',
        progressStatus: 'PENDING',
      },
    });

    const tableQueue = await this.prisma.tableQueue.create({
      data: {
        tableId: availableTable.id,
        queueId: booking.id,
        status: 'RESERVED',
      },
      include: {
        table: true,
        queue: true,
      },
    });

    return tableQueue;
  }

  async getBookingById(id: string) {
    const booking = await this.prisma.tableQueue.findUnique({
      where: { id },
      include: {
        table: true,
        queue: {
          include: {
            restaurant: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }
}
