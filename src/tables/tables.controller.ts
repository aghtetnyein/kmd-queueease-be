import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TablesService } from './tables.service';
import { HttpExceptionFilter } from 'libs/helpers/src/http-exception.filter';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UseFilters } from '@nestjs/common';
import { JwtAuthGuard } from 'src/admins/guards/jwt-auth.guard';

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
    @Query() query: { page?: string; page_size?: string; search?: string },
  ) {
    return this.tablesService.getAllTables(query);
  }
}
