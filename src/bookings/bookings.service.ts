import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'libs/helpers/src';
import { parse, startOfDay, endOfDay } from 'date-fns';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllBookingsByRestaurantIdAndDay(day: string, restaurantId: string) {
    const dayDate = parse(day, 'yyyy-MM-dd', new Date());
    const bookings = await this.prisma.queue.findMany({
      where: {
        timeSlot: {
          gte: startOfDay(dayDate),
          lte: endOfDay(dayDate),
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
    let selectedDate = new Date(data.selectedDate);
    const selectedSlot = new Date(data.selectedSlot);
    const timeSlot = new Date(
      selectedDate.setHours(
        selectedSlot.getHours(),
        selectedSlot.getMinutes(),
        0,
        0,
      ),
    );

    // Check for existing booking at the same timeslot
    const existingBooking = await this.prisma.queue.findFirst({
      where: {
        restaurantId: data.restaurantId,
        timeSlot: timeSlot,
      },
    });

    if (existingBooking) {
      throw new ConflictException(
        'There is already a booking at this timeslot',
      );
    }

    const booking = await this.prisma.queue.create({
      data: {
        restaurantId: data.restaurantId,
        customerId: customer.id,
        partySize: Number(data.partySize),
        timeSlot: timeSlot,
        status: 'BOOKING',
        progressStatus: 'PENDING',
      },
    });
    return booking;
  }
}
