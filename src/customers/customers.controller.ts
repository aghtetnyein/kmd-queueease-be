import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { HttpExceptionFilter } from 'libs/helpers/src/http-exception.filter';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UseFilters } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateCustomerDto } from './dto/create-customer.dto';
import {
  RegisterExistingCustomerDto,
  RegisterNewCustomerDto,
} from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import {
  CustomerChangePasswordResponseSchema,
  CustomerLoginResponseSchema,
  GetCustomerProfileResponseSchema,
} from './response-schemas';
import { JwtAuthGuard as CustomerJwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtAuthGuard as AdminJwtAuthGuard } from 'src/admins/guards/jwt-auth.guard';

import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('customers')
@UseFilters(HttpExceptionFilter)
@ApiTags('Customer')
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly jwtService: JwtService,
  ) {}

  // Get all customers
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard)
  @ApiOperation({
    summary: 'Get all customers',
    description: 'Get all customers',
  })
  @Get('')
  getAllCustomers(
    @Query() query: { page?: string; page_size?: string; search?: string },
  ) {
    return this.customersService.getAllCustomers(query);
  }

  // Customer create
  @ApiOperation({
    summary: 'Customer create',
    description: 'Customer can create',
  })
  @ApiBody({ type: CreateCustomerDto })
  @Post('create')
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  // New customer register
  @ApiOperation({
    summary: 'New customer register',
    description: 'New customer can register',
  })
  @ApiBody({ type: RegisterNewCustomerDto })
  @Post('register')
  register(@Body() registerCustomerDto: RegisterNewCustomerDto) {
    return this.customersService.registerNewCustomer(registerCustomerDto);
  }

  @ApiOperation({
    summary: 'Existing customer register',
    description: 'Existing customer can register',
  })
  @ApiBody({ type: RegisterExistingCustomerDto })
  @Post('register/existing')
  registerExisting(@Body() registerCustomerDto: RegisterExistingCustomerDto) {
    return this.customersService.registerExistingCustomer(registerCustomerDto);
  }

  // Customer Login
  @ApiOperation({
    summary: 'Customer login',
    description: 'Customer can use phone number and password to login',
  })
  @ApiBody({ type: LoginCustomerDto })
  @ApiResponse({
    status: 200,
    description: 'Admin login successfully',
    content: {
      'application/json': {
        schema: CustomerLoginResponseSchema,
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
  login(@Body() loginCustomerDto: LoginCustomerDto) {
    return this.customersService.login(loginCustomerDto);
  }

  // Get customer profile
  @ApiOperation({
    summary: 'Customer profile',
    description: 'Customer can get their profile',
  })
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Customer profile',
    content: {
      'application/json': {
        schema: GetCustomerProfileResponseSchema,
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
        secret: process.env.JWT_CUSTOMER_SECRET,
      });
      return this.customersService.me(decoded.phoneNo);
    } catch (error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  // Change customer password
  @ApiOperation({
    summary: 'Change customer password',
    description: 'Customer can change their password',
  })
  @Post('change-password')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    content: {
      'application/json': {
        schema: CustomerChangePasswordResponseSchema,
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
        secret: process.env.JWT_CUSTOMER_SECRET,
      });
      return this.customersService.changePassword(
        decoded.phoneNo,
        changePasswordDto,
      );
    } catch (error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
