import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'libs/helpers/src';
import { CreateCustomerDto } from './dto/create-customer.dto';
import {
  RegisterExistingCustomerDto,
  RegisterNewCustomerDto,
} from './dto/register-customer.dto';
import { getHashedPassword } from 'src/utils';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { compareSync } from 'bcrypt';
import { omit } from 'lodash';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async generateCustomerToken(phoneNo: string) {
    return {
      accessToken: await this.jwtService.signAsync(
        { phoneNo },
        {
          secret: this.configService.get('JWT_CUSTOMER_SECRET'),
          expiresIn: '24h',
        },
      ),
    };
  }

  async validateCustomerAccountByPhoneNo(phoneNo: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { phoneNo },
    });
    if (!customer) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return customer;
  }

  async getAllCustomers() {
    return this.prisma.customer.findMany();
  }

  async create(createCustomerDto: CreateCustomerDto) {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { phoneNo: createCustomerDto.phoneNo },
    });
    if (existingCustomer) {
      throw new HttpException(
        'Phone number already in use',
        HttpStatus.CONFLICT,
      );
    }
    const customer = await this.prisma.customer.create({
      data: {
        ...createCustomerDto,
        isAccountCreated: false,
      },
    });
    return customer;
  }

  async registerNewCustomer(registerNewCustomerDto: RegisterNewCustomerDto) {
    const existingCustomer = await this.prisma.customer.findFirst({
      where: {
        OR: [
          { phoneNo: registerNewCustomerDto.phoneNo },
          { email: registerNewCustomerDto.email },
        ],
      },
    });
    if (!existingCustomer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }
    if (existingCustomer.isAccountCreated) {
      throw new HttpException(
        'Customer already registered',
        HttpStatus.CONFLICT,
      );
    } else {
      if (existingCustomer.phoneNo === registerNewCustomerDto.phoneNo) {
        throw new HttpException(
          'Phone number already in use',
          HttpStatus.CONFLICT,
        );
      }
      if (existingCustomer.email === registerNewCustomerDto.email) {
        throw new HttpException('Email already in use', HttpStatus.CONFLICT);
      }
    }

    const customer = await this.prisma.customer.create({
      data: {
        ...registerNewCustomerDto,
        name: registerNewCustomerDto.name,
        isAccountCreated: true,
      },
    });
    return customer;
  }

  async registerExistingCustomer(
    registerExistingCustomerDto: RegisterExistingCustomerDto,
  ) {
    const existingCustomer = await this.prisma.customer.findFirst({
      where: { phoneNo: registerExistingCustomerDto.phoneNo },
    });
    if (!existingCustomer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }
    if (existingCustomer.isAccountCreated) {
      throw new HttpException(
        'Customer already registered',
        HttpStatus.CONFLICT,
      );
    }

    const registeredCustomer = await this.prisma.customer.update({
      where: { id: existingCustomer.id },
      data: {
        email: registerExistingCustomerDto.email,
        password: getHashedPassword(registerExistingCustomerDto.password),
        isAccountCreated: true,
      },
    });
    return registeredCustomer;
  }

  async login(loginCustomerDto: LoginCustomerDto) {
    const customer = await this.validateCustomerAccountByPhoneNo(
      loginCustomerDto.phoneNo,
    );
    if (!customer) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    if (!customer.isAccountCreated) {
      throw new HttpException('Customer not registered', HttpStatus.NOT_FOUND);
    }
    if (
      !customer ||
      !compareSync(loginCustomerDto.password, customer.password)
    ) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return this.generateCustomerToken(customer.phoneNo);
  }

  async me(phoneNo: string) {
    const customer = await this.validateCustomerAccountByPhoneNo(phoneNo);
    if (!customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }
    return omit(customer, ['id', 'password', 'createdAt', 'updatedAt']);
  }
}
