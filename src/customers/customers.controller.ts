import { Body, Controller, Get, Post } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { HttpExceptionFilter } from 'libs/helpers/src/http-exception.filter';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UseFilters } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateCustomerDto } from './dto/create-customer.dto';
import {
  RegisterExistingCustomerDto,
  RegisterNewCustomerDto,
} from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';

@Controller('customers')
@UseFilters(HttpExceptionFilter)
@ApiTags('Customer')
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({
    summary: 'Get all customers',
    description: 'Get all customers',
  })
  @Get('')
  getAllCustomers() {
    return this.customersService.getAllCustomers();
  }

  @ApiOperation({
    summary: 'Customer create',
    description: 'Customer can create',
  })
  @ApiBody({ type: CreateCustomerDto })
  @Post('create')
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

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

  @ApiOperation({
    summary: 'Customer login',
    description: 'Customer can use phone number and password to login',
  })
  @ApiBody({ type: LoginCustomerDto })
  @Post('login')
  login(@Body() loginCustomerDto: LoginCustomerDto) {
    return this.customersService.login(loginCustomerDto);
  }
}
