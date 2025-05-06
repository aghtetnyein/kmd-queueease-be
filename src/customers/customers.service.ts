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
import { Customer, OrderStatus, QueueStatus } from '@prisma/client';
import { PlaceOrderDto } from './dto/place-order.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

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
      const customer = await this.prisma.customer.create({
        data: {
          ...registerNewCustomerDto,
          password: getHashedPassword(registerNewCustomerDto.password),
          isAccountCreated: true,
        },
      });
      return customer;
    } else {
      if (existingCustomer.isAccountCreated) {
        throw new HttpException(
          'Customer already registered',
          HttpStatus.CONFLICT,
        );
      } else {
        const registeredCustomer = await this.prisma.customer.update({
          where: { id: existingCustomer.id },
          data: {
            email: registerNewCustomerDto.email,
            password: getHashedPassword(registerNewCustomerDto.password),
            isAccountCreated: true,
          },
        });

        return registeredCustomer;
      }
    }
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

  async update(updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.validateCustomerAccountByPhoneNo(
      updateCustomerDto.phoneNo,
    );
    if (!customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }
    await this.prisma.customer.update({
      where: { id: customer.id },
      data: updateCustomerDto,
    });
    return { message: 'Customer updated successfully' };
  }

  async deleteCustomer(id: string) {
    await this.prisma.customer.delete({
      where: { id },
    });
    return { message: 'Customer deleted successfully' };
  }

  async getQueues(phoneNo: string, query: { queue_type: string }) {
    const customer = await this.prisma.customer.findUnique({
      where: { phoneNo },
    });
    if (!customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }
    const queues = await this.prisma.queue.findMany({
      where: {
        customerId: customer.id,
        initialStatus: query.queue_type as QueueStatus,
      },
      include: {
        customer: true,
        restaurant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return queues;
  }

  async getQueueDetails(queueNo: string) {
    const queue = await this.prisma.queue.findUnique({
      where: { queueNo },
      include: {
        customer: true,
        restaurant: true,
        table: true,
      },
    });
    if (!queue) {
      throw new HttpException('Queue not found', HttpStatus.NOT_FOUND);
    }
    return queue;
  }

  async placeOrder(placeOrderDto: PlaceOrderDto) {
    const queue = await this.prisma.queue.findUnique({
      where: { queueNo: placeOrderDto.queueNo },
    });
    if (!queue) {
      throw new HttpException('Queue not found', HttpStatus.NOT_FOUND);
    }

    const order = await this.prisma.order.create({
      data: {
        queueId: queue.id,
        tableId: queue.tableId,
        customerId: queue.customerId,
        restaurantId: queue.restaurantId,
      },
    });

    for (const mealItem of placeOrderDto.meals) {
      const meal = await this.prisma.meal.findUnique({
        where: { id: mealItem.id },
      });
      if (!meal) {
        throw new HttpException('Meal not found', HttpStatus.NOT_FOUND);
      }

      await this.prisma.orderMeal.create({
        data: {
          orderId: order.id,
          mealId: meal.id,
          quantity: mealItem.count,
        },
      });
    }
    const createdOrder = await this.prisma.order.findUnique({
      where: { id: order.id },
      include: {
        meals: {
          include: {
            meal: true,
          },
        },
      },
    });

    return {
      order: createdOrder,
      message: 'Order placed successfully',
    };
  }

  async getAllMealsByQueueNo(queueNo: string) {
    const queue = await this.prisma.queue.findUnique({
      where: { queueNo },
      include: {
        orders: {
          include: {
            meals: {
              include: {
                meal: true,
              },
            },
          },
        },
      },
    });

    if (!queue) {
      throw new HttpException('Queue not found', HttpStatus.NOT_FOUND);
    }

    if (!queue.orders || queue.orders.length === 0) {
      return {
        queueNo,
        orderMeals: [],
        totalAmount: 0,
      };
    }

    // First, collect all meals with their quantities
    const mealMap = new Map<
      string,
      {
        id: string;
        name: string;
        category: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }
    >();

    queue.orders.forEach((order) => {
      order.meals.forEach((orderMeal) => {
        const id = orderMeal.meal.id;
        if (mealMap.has(id)) {
          // If meal already exists, update quantities and total price
          const existingMeal = mealMap.get(id)!;
          existingMeal.quantity += orderMeal.quantity;
          existingMeal.totalPrice += orderMeal.quantity * orderMeal.meal.price;
        } else {
          // If it's a new meal, add it to the map
          mealMap.set(id, {
            id,
            name: orderMeal.meal.name,
            category: orderMeal.meal.category,
            quantity: orderMeal.quantity,
            unitPrice: orderMeal.meal.price,
            totalPrice: orderMeal.quantity * orderMeal.meal.price,
          });
        }
      });
    });

    // Convert map to array
    const combinedOrderMeals = Array.from(mealMap.values());

    // Calculate total amount
    const totalAmount = combinedOrderMeals.reduce(
      (sum, meal) => sum + meal.totalPrice,
      0,
    );

    return {
      queueNo,
      orderMeals: combinedOrderMeals,
      totalAmount,
    };
  }

  async getAllOrdersByQueueNo(queueNo: string) {
    const queue = await this.prisma.queue.findUnique({
      where: { queueNo },
      include: {
        orders: {
          include: {
            meals: {
              include: {
                meal: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!queue) {
      throw new HttpException('Queue not found', HttpStatus.NOT_FOUND);
    }

    return queue.orders;
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
    });

    return order;
  }
}
