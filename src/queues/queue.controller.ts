import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { QueueService } from './queue.service';
import { HttpExceptionFilter } from 'libs/helpers/src/http-exception.filter';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UseFilters } from '@nestjs/common';
import { CreateQueueDto } from './dto/create-queue.dto';

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
  @Get('')
  getAllQueuesByRestaurantIdAndDay(
    @Query('day') day: string,
    @Query('restaurantId') restaurantId: string,
  ) {
    return this.queueService.getAllQueuesByRestaurantIdAndDay(
      day,
      restaurantId,
      'between',
    );
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
  @Get(':id')
  getQueueById(@Param('id') id: string) {
    return this.queueService.getQueueById(id);
  }
}
