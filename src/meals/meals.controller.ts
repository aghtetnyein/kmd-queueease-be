import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MealsService } from './meals.service';
import { HttpExceptionFilter } from 'libs/helpers/src/http-exception.filter';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UseFilters } from '@nestjs/common';
import { JwtAuthGuard } from 'src/admins/guards/jwt-auth.guard';

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
    @Query() query: { page?: string; page_size?: string; search?: string },
  ) {
    return this.mealsService.getAllMeals(query);
  }
}
