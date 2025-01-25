import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UseFilters,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { LoginAdminDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'libs/helpers/src/http-exception.filter';
import { JwtService } from '@nestjs/jwt';

@Controller('admin')
@UseFilters(HttpExceptionFilter)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({
    summary: 'Admin login',
    description: 'Admin can use email and password to login',
  })
  @ApiBody({ type: LoginAdminDto })
  @Post('login')
  login(@Body() loginAdminDto: LoginAdminDto) {
    return this.adminService.login(loginAdminDto);
  }

  @ApiOperation({
    summary: 'Admin profile',
    description: 'Admin can get their profile',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  getProfile(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_ADMIN_SECRET,
      });
      return this.adminService.me(decoded.email);
    } catch (error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
