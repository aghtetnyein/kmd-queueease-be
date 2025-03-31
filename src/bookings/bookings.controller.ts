import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { HttpExceptionFilter } from 'libs/helpers/src/http-exception.filter';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UseFilters } from '@nestjs/common';
import { JwtAuthGuard as AdminJwtAuthGuard } from 'src/admins/guards/jwt-auth.guard';
import { JwtAuthGuard as CustomerJwtAuthGuard } from 'src/customers/guards/jwt-auth.guard';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
@UseFilters(HttpExceptionFilter)
@ApiTags('Bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Get all bookings
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard)
  @ApiOperation({
    summary: 'Get all bookings by day',
    description: 'Get all bookings by day',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        day: { type: 'string' },
      },
    },
  })
  @Get('/:day')
  getAllBookingsByDay(@Param('day') day: string) {
    return this.bookingsService.getAllBookingsByDay(day);
  }

  // Create a booking
  @ApiOperation({
    summary: 'Create a booking',
    description: 'Create a booking',
  })
  @Post('')
  createBooking(@Body() body: CreateBookingDto) {
    return this.bookingsService.createBooking(body);
  }
}
