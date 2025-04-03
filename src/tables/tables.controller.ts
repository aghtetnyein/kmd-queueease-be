import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Body,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { HttpExceptionFilter } from 'libs/helpers/src/http-exception.filter';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UseFilters } from '@nestjs/common';
import { JwtAuthGuard } from 'src/admins/guards/jwt-auth.guard';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Controller('tables')
@UseFilters(HttpExceptionFilter)
@ApiTags('Tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  // Get all tables
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all tables',
    description: 'Get all tables',
  })
  @Get('')
  getAllTables(
    @Query()
    query: {
      restaurant_id: string;
      page?: string;
      page_size?: string;
      search?: string;
    },
  ) {
    return this.tablesService.getAllTables(query);
  }

  // Add a table
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Add a table',
    description: 'Add a table',
  })
  @Post('')
  addTable(@Body() body: CreateTableDto) {
    return this.tablesService.addTable(body);
  }

  // Update a table
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update a table',
    description: 'Update a table',
  })
  @Put(':id')
  updateTable(@Param('id') id: string, @Body() body: UpdateTableDto) {
    return this.tablesService.updateTable(id, body);
  }

  // Delete a table
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a table',
    description: 'Delete a table',
  })
  @Delete(':id')
  deleteTable(@Param('id') id: string) {
    return this.tablesService.deleteTable(id);
  }

  // Get table of largest party size
  @ApiOperation({
    summary: 'Get table of largest party size',
    description: 'Get table of largest party size',
  })
  @Get('largest-party-size/:restaurantId')
  getTableofLargestPartySize(
    @Param('restaurantId') restaurantId: string,
    @Query('timeSlot') timeSlot: string,
  ) {
    return this.tablesService.getTableofLargestPartySizeAvailable(
      restaurantId,
      timeSlot,
    );
  }
}
