import { Controller, Get, Param, Query, Post, Body, Put } from '@nestjs/common';
import { QueueService } from './queue.service';
import { HttpExceptionFilter } from 'libs/helpers/src/http-exception.filter';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UseFilters } from '@nestjs/common';
import { CreateQueueDto } from './dto/create-queue.dto';
import { UpdateQueueStatusDto } from './dto/update-queue-status.dto';
import { QueueStatus } from '@prisma/client';
import { endOfDay } from 'date-fns';
import { startOfDay } from 'date-fns';

@Controller('queues')
@UseFilters(HttpExceptionFilter)
@ApiTags('Queues')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  // Get all queues
  @ApiOperation({
    summary: 'Get all queues by restaurant id and day',
    description: 'Get all queues by restaurant id and day',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        day: { type: 'string' },
        restaurantId: { type: 'string' },
      },
    },
  })
  @Get('home-page')
  getAllQueuesForHomePage(
    @Query('day') day: string,
    @Query('restaurantId') restaurantId: string,
    @Query('queueType') queueType?: QueueStatus,
    @Query('isForToday') isForToday?: boolean,
  ) {
    return this.queueService.getAllQueuesForHomePage({
      day,
      restaurantId,
      queueType,
      isForToday,
    });
  }

  @Get('')
  getAllQueuesByRestaurantIdAndDay(
    @Query('day') day: string,
    @Query('restaurantId') restaurantId: string,
    @Query('queueType') queueType?: QueueStatus,
    @Query('isForCustomerBooking') isForCustomerBooking?: boolean,
  ) {
    return this.queueService.getAllQueuesByRestaurantIdAndDay({
      restaurantId,
      queueType,
      isForCustomerBooking,
      timeSlotCompareLogic: {
        gte: startOfDay(day),
        lte: endOfDay(day),
      },
    });
  }

  // Get waitlist count and estimated wait time
  @ApiOperation({
    summary: 'Get waitlist count and estimated wait time',
    description: 'Get waitlist count and estimated wait time',
  })
  @Get('waitlist')
  getWaitlistByRestaurantIdAndDay(
    @Query('restaurantId') restaurantId: string,
    @Query('day') day: string,
  ) {
    return this.queueService.getWaitlistByRestaurantIdAndDay({
      restaurantId,
      day,
    });
  }

  // Create a queue
  @ApiOperation({
    summary: 'Create a queue',
    description: 'Create a queue',
  })
  @Post('')
  createQueue(@Body() body: CreateQueueDto) {
    return this.queueService.createQueue(body);
  }

  // Get a queue by id
  @ApiOperation({
    summary: 'Get a queue by id',
    description: 'Get a queue by id',
  })
  @Get(':queueNo')
  getQueueByQueueNo(@Param('queueNo') queueNo: string) {
    return this.queueService.getQueueByQueueNo(queueNo);
  }

  // Update a queue status
  @ApiOperation({
    summary: 'Update a queue status',
    description: 'Update a queue status',
  })
  @Put('update-status/:id')
  updateQueueStatus(
    @Param('id') id: string,
    @Body() body: UpdateQueueStatusDto,
  ) {
    return this.queueService.updateQueueStatuses({
      id,
      tableId: body.tableId,
      status: body.status,
      progressStatus: body.progressStatus,
    });
  }
}
