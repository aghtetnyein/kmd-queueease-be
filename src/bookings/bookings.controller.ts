import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { HttpExceptionFilter } from 'libs/helpers/src/http-exception.filter';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UseFilters } from '@nestjs/common';
import { JwtAuthGuard } from 'src/admins/guards/jwt-auth.guard';

@Controller('bookings')
@UseFilters(HttpExceptionFilter)
@ApiTags('Bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Get all bookings
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
}
