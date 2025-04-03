import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { StaffsService } from './staffs.service';
import { HttpExceptionFilter } from 'libs/helpers/src/http-exception.filter';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UseFilters } from '@nestjs/common';
import { JwtAuthGuard } from 'src/admins/guards/jwt-auth.guard';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

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
    @Query()
    query: {
      restaurant_id: string;
      page?: string;
      page_size?: string;
      search?: string;
    },
  ) {
    return this.staffsService.getAllStaffs(query);
  }

  // Create a staff
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a staff',
    description: 'Create a staff',
  })
  @Post('')
  createStaff(@Body() body: CreateStaffDto) {
    return this.staffsService.createStaff(body);
  }

  // Update a staff
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update a staff',
    description: 'Update a staff',
  })
  @Put(':id')
  updateStaff(@Param('id') id: string, @Body() body: UpdateStaffDto) {
    return this.staffsService.updateStaff(id, body);
  }

  // Delete a staff
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a staff',
    description: 'Delete a staff',
  })
  @Delete(':id')
  deleteStaff(@Param('id') id: string) {
    return this.staffsService.deleteStaff(id);
  }
}
