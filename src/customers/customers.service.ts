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
import { ChangePasswordDto } from './dto/change-password.dto';
import { Customer } from '@prisma/client';

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

  async getAllCustomers({
    page = '1',
    page_size = '20',
    search,
  }: {
    page?: string;
    page_size?: string;
    search?: string;
  }) {
    const skip = (Number(page) - 1) * Number(page_size);

    let customers: Customer[];
    let total: number;

    if (search) {
      [customers, total] = await Promise.all([
        this.prisma.customer.findMany({
          where: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phoneNo: { contains: search } },
            ],
          },
          skip,
          take: Number(page_size),
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.customer.count({
          where: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phoneNo: { contains: search } },
            ],
          },
        }),
      ]);
    } else {
      [customers, total] = await Promise.all([
        this.prisma.customer.findMany({
          skip,
          take: Number(page_size),
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.customer.count(),
      ]);
    }

    return {
      data: customers,
      page_data: {
        total: Number(total),
        page: Number(page),
        page_size: Number(page_size),
        total_pages: Math.ceil(Number(total) / Number(page_size)),
        has_previous_page: Number(page) > 1,
        has_next_page:
          Number(page) < Math.ceil(Number(total) / Number(page_size)),
      },
    };
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

  async changePassword(phoneNo: string, changePasswordDto: ChangePasswordDto) {
    const customer = await this.validateCustomerAccountByPhoneNo(phoneNo);
    if (!customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }
    if (!compareSync(changePasswordDto.oldPassword, customer.password)) {
      throw new HttpException('Invalid old password', HttpStatus.BAD_REQUEST);
    }
    if (changePasswordDto.oldPassword === changePasswordDto.newPassword) {
      throw new HttpException(
        'New password cannot be the same as the old password',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = getHashedPassword(changePasswordDto.newPassword);
    await this.prisma.customer.update({
      where: { id: customer.id },
      data: { password: hashedPassword },
    });
    return { message: 'Password changed successfully' };
  }

  async deleteCustomer(id: string) {
    await this.prisma.customer.delete({
      where: { id },
    });
    return { message: 'Customer deleted successfully' };
  }
}
