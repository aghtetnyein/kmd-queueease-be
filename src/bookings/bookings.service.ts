import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/helpers/src';
import { Queue } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllBookingsByDay(day: string) {
    const bookings = await this.prisma.queue.findMany({
      where: {
        timeSlot: {
          gte: new Date(`${day}T00:00:00Z`),
          lte: new Date(`${day}T23:59:59.999Z`),
        },
        status: 'BOOKING',
      },
      include: {
        customer: true,
      },
    });
    return bookings;
  }
}
