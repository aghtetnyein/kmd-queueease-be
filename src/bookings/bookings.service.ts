import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/helpers/src';
import { Queue } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllBookingsByRestaurantIdAndDay(day: string, restaurantId: string) {
    const bookings = await this.prisma.queue.findMany({
      where: {
        timeSlot: {
          gte: new Date(`${day}T00:00:00Z`),
          lte: new Date(`${day}T23:59:59.999Z`),
        },
        status: 'BOOKING',
        restaurantId,
      },
      include: {
        customer: true,
      },
    });
    return bookings;
  }

  async createBooking(data: CreateBookingDto) {
    const booking = await this.prisma.queue.create({
      data: {
        restaurantId: data.restaurantId,
        customerId: data.customerId,
        partySize: data.partySize,
        timeSlot: data.timeSlot,
        status: 'BOOKING',
        progressStatus: 'PENDING',
      },
    });
    return booking;
  }
}
