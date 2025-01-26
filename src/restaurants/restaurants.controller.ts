import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { RestaurantService } from './restaurants.service';
import { HttpExceptionFilter } from 'libs/helpers/src';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { JwtAuthGuard } from 'src/admin/guards/jwt-auth.guard';

@Controller('restaurant')
@UseFilters(HttpExceptionFilter)
@ApiTags('Restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ApiOperation({
    summary: 'Get restaurant',
    description: 'Get a restaurant',
  })
  @Get('')
  getAllRestaurants() {
    return this.restaurantService.getAllRestaurants();
  }

  @ApiOperation({
    summary: 'Create restaurant',
    description: 'Create a restaurant',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CreateRestaurantDto })
  @Post('create')
  createRestaurant(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantService.createRestaurant(createRestaurantDto);
  }

  @ApiOperation({
    summary: 'Get restaurant by id',
    description: 'Get a restaurant by id',
  })
  @Get(':id')
  getRestaurantById(@Param('id') id: string) {
    return this.restaurantService.getRestaurantById(id);
  }
}
