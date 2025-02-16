import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
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
import { JwtAuthGuard } from './guards/jwt-auth.guard';
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
  @ApiOperation({
    summary: 'Get all customers',
    description: 'Get all customers',
  })
  @Get('')
  getAllCustomers() {
    return this.customersService.getAllCustomers();
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
