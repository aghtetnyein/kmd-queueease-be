import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StaffsService } from './staffs.service';
import { HttpExceptionFilter } from 'libs/helpers/src/http-exception.filter';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UseFilters } from '@nestjs/common';
import { JwtAuthGuard } from 'src/admins/guards/jwt-auth.guard';

@Controller('staffs')
@UseFilters(HttpExceptionFilter)
@ApiTags('Staffs')
export class StaffsController {
  constructor(private readonly staffsService: StaffsService) {}

  // Get all staffs
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all staffs',
    description: 'Get all staffs',
  })
  @Get('')
  getAllStaffs(
    @Query() query: { page?: string; page_size?: string; search?: string },
  ) {
    return this.staffsService.getAllStaffs(query);
  }
}
