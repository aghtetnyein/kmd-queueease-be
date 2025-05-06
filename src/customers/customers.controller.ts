import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
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
  ApiQuery,
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
import { PlaceOrderDto } from './dto/place-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

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

  // Update customer
  @ApiOperation({
    summary: 'Customer profile update',
    description: 'Customer can update their profile',
  })
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateCustomerDto })
  @Post('update-profile')
  updateCustomer(@Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(updateCustomerDto);
  }

  // Delete customer
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard)
  @ApiOperation({
    summary: 'Delete customer',
    description: 'Customer can delete their account',
  })
  @Delete(':id')
  deleteCustomer(@Param('id') id: string) {
    return this.customersService.deleteCustomer(id);
  }

  // Customer queues
  @ApiBearerAuth()
  @UseGuards(CustomerJwtAuthGuard)
  @ApiOperation({
    summary: 'Customer queues',
    description: 'Customer can get their queues',
  })
  @ApiQuery({
    name: 'phone_no',
    type: String,
    description: 'Customer phone number',
  })
  @ApiQuery({
    name: 'queue_type',
    type: String,
    description: 'Queue type',
  })
  @Get('queues')
  getQueues(
    @Req() req: Request,
    @Query() query: { phone_no: string; queue_type: string },
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
      return this.customersService.getQueues(query.phone_no, query);
    } catch (error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  // Customer queue details
  @ApiOperation({
    summary: 'Customer queue details',
    description: 'Customer can get their queue details',
  })
  @Get('queue-details/:queueNo')
  getQueueDetails(@Param('queueNo') queueNo: string) {
    return this.customersService.getQueueDetails(queueNo);
  }

  // Customer place order
  @ApiOperation({
    summary: 'Customer place order',
    description: 'Customer can place order',
  })
  @Post('place-order')
  placeOrder(@Body() placeOrderDto: PlaceOrderDto) {
    return this.customersService.placeOrder(placeOrderDto);
  }

  // Get all meals by order id
  @ApiOperation({
    summary: 'Get all meals by queue no',
    description: 'Get all meals by queue no',
  })
  @Get('order-meals/:queueNo')
  getAllMealsByQueueNo(@Param('queueNo') queueNo: string) {
    return this.customersService.getAllMealsByQueueNo(queueNo);
  }

  // Get all orders by queue no
  @ApiOperation({
    summary: 'Get all orders by queue no',
    description: 'Get all orders by queue no',
  })
  @Get('orders/:queueNo')
  getAllOrdersByQueueNo(@Param('queueNo') queueNo: string) {
    return this.customersService.getAllOrdersByQueueNo(queueNo);
  }

  // Update order status
  @ApiOperation({
    summary: 'Update order status',
    description: 'Update order status',
  })
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    type: UpdateOrderStatusDto,
  })
  @Put('update-order-status/:orderId')
  updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() body: { status: string },
  ) {
    return this.customersService.updateOrderStatus(orderId, body.status);
  }
}
