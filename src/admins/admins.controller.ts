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
  Put,
} from '@nestjs/common';
import { AdminService } from './admins.service';
import { LoginAdminDto } from './dto/login-admin.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HttpExceptionFilter } from 'libs/helpers/src/http-exception.filter';
import { JwtService } from '@nestjs/jwt';
import { RegisterAdminDto } from './dto/register-admin.dto';
import {
  AdminProfileResponseSchema,
  AdminLoginResponseSchema,
  AdminChangePasswordResponseSchema,
} from './response-schemas';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('admin')
@UseFilters(HttpExceptionFilter)
@ApiTags('Admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) {}

  // Login admin
  @ApiOperation({
    summary: 'Admin login',
    description: 'Admin can use email and password to login',
  })
  @ApiBody({ type: LoginAdminDto })
  @ApiResponse({
    status: 200,
    description: 'Admin login successfully',
    content: {
      'application/json': {
        schema: AdminLoginResponseSchema,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @Post('login')
  login(@Body() loginAdminDto: LoginAdminDto) {
    return this.adminService.login(loginAdminDto);
  }

  // Register admin
  @ApiOperation({
    summary: 'Admin register',
    description: 'Admin can register',
  })
  @ApiBody({ type: RegisterAdminDto })
  @ApiResponse({
    status: 200,
    description: 'Admin register successfully',
    content: {
      'application/json': {
        schema: AdminProfileResponseSchema,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Post('register')
  register(@Body() registerAdminDto: RegisterAdminDto) {
    return this.adminService.register(registerAdminDto);
  }

  // Get admin profile
  @ApiOperation({
    summary: 'Admin profile',
    description: 'Admin can get their profile',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Admin profile',
    content: {
      'application/json': {
        schema: AdminProfileResponseSchema,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Admin not found',
  })
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
      return this.adminService.me(decoded.phoneNo);
    } catch (error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  // Update admin profile
  @ApiOperation({
    summary: 'Update admin profile',
    description: 'Admin can update their profile',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateAdminDto })
  @ApiResponse({
    status: 200,
    description: 'Admin profile',
    content: {
      'application/json': {
        schema: AdminProfileResponseSchema,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Admin not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @Put('update')
  updateProfile(@Req() req: Request, @Body() updateAdminDto: UpdateAdminDto) {
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
      return this.adminService.update(decoded.phoneNo, updateAdminDto);
    } catch (error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  // Change admin password
  @ApiOperation({
    summary: 'Change admin password',
    description: 'Admin can change their password',
  })
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    content: {
      'application/json': {
        schema: AdminChangePasswordResponseSchema,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @Post('change-password')
  changePassword(
    @Req() req: Request,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
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
      return this.adminService.changePassword(
        decoded.phoneNo,
        changePasswordDto,
      );
    } catch (error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
