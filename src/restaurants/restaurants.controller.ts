import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { RestaurantService } from './restaurants.service';
import { HttpExceptionFilter } from 'libs/helpers/src';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { JwtAuthGuard } from 'src/admins/guards/jwt-auth.guard';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import {
  CreateRestaurantResponseSchema,
  UpdateRestaurantResponseSchema,
} from './response-schemas';
import { UpdateRestaurantOpenDaysDto } from './dto/update-restaurant-days.dto';
import { UpdateRestaurantOpenHoursDto } from './dto/update-restaurant-hours.dto';

@Controller('restaurant')
@UseFilters(HttpExceptionFilter)
@ApiTags('Restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ApiOperation({
    summary: 'Get all restaurants',
    description: 'Get all restaurants',
  })
  @Get('')
  getAllRestaurants(@Query('search') search?: string) {
    return this.restaurantService.getAllRestaurants({ search });
  }

  @ApiOperation({
    summary: 'Create restaurant',
    description: 'Create a restaurant',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CreateRestaurantDto })
  @ApiResponse({
    status: 201,
    description: 'Restaurant created successfully',
    content: {
      'application/json': {
        schema: CreateRestaurantResponseSchema,
      },
    },
  })
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

  @ApiOperation({
    summary: 'Get restaurant by slug',
    description: 'Get a restaurant by slug',
  })
  @Get('/details/:slug')
  getRestaurantDetailsBySlug(@Param('slug') slug: string) {
    return this.restaurantService.getRestaurantDetailsBySlug(slug);
  }

  @ApiOperation({
    summary: 'Update restaurant',
    description: 'Update a restaurant',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateRestaurantDto })
  @ApiResponse({
    status: 200,
    description: 'Restaurant updated successfully',
    content: {
      'application/json': {
        schema: UpdateRestaurantResponseSchema,
      },
    },
  })
  @Put(':id')
  updateRestaurant(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    return this.restaurantService.updateRestaurant(id, updateRestaurantDto);
  }

  @ApiOperation({
    summary: 'Delete restaurant',
    description: 'Delete a restaurant',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  deleteRestaurant(@Param('id') id: string) {
    return this.restaurantService.deleteRestaurant(id);
  }

  @ApiOperation({
    summary: 'Update restaurant open days',
    description: 'Update the open days of a restaurant',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateRestaurantOpenDaysDto })
  @Put(':id/open-days')
  updateRestaurantOpenDays(
    @Param('id') id: string,
    @Body() updateRestaurantOpenDaysDto: UpdateRestaurantOpenDaysDto,
  ) {
    return this.restaurantService.updateRestaurantOpenDays(
      id,
      updateRestaurantOpenDaysDto,
    );
  }

  @ApiOperation({
    summary: 'Update restaurant open hours',
    description: 'Update the open hours of a restaurant',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateRestaurantOpenHoursDto })
  @Put(':id/open-hours')
  updateRestaurantOpenHours(
    @Param('id') id: string,
    @Body() updateRestaurantOpenHoursDto: UpdateRestaurantOpenHoursDto,
  ) {
    return this.restaurantService.updateRestaurantOpenHours(
      id,
      updateRestaurantOpenHoursDto,
    );
  }
}
