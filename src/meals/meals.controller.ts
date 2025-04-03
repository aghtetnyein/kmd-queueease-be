import {
  Controller,
  Get,
  Query,
  UseGuards,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { MealsService } from './meals.service';
import { HttpExceptionFilter } from 'libs/helpers/src/http-exception.filter';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UseFilters } from '@nestjs/common';
import { JwtAuthGuard } from 'src/admins/guards/jwt-auth.guard';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@Controller('meals')
@UseFilters(HttpExceptionFilter)
@ApiTags('Meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  // Get all meals
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all meals',
    description: 'Get all meals',
  })
  @Get('')
  getAllStaffs(
    @Query()
    query: {
      restaurant_id: string;
      page?: string;
      page_size?: string;
      search?: string;
    },
  ) {
    return this.mealsService.getAllMeals(query);
  }

  // Create a meal
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a meal',
    description: 'Create a meal',
  })
  @Post('')
  createMeal(@Body() body: CreateMealDto) {
    return this.mealsService.createMeal(body);
  }

  // Update a meal
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update a meal',
    description: 'Update a meal',
  })
  @Put(':id')
  updateMeal(@Param('id') id: string, @Body() body: UpdateMealDto) {
    return this.mealsService.updateMeal(id, body);
  }

  // Delete a meal
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a meal',
    description: 'Delete a meal',
  })
  @Delete(':id')
  deleteMeal(@Param('id') id: string) {
    return this.mealsService.deleteMeal(id);
  }
}
