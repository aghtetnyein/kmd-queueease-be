import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'libs/helpers/src';
import { ConfigService } from '@nestjs/config';
import { LoginAdminDto } from './dto/login-admin.dto';
import { compareSync } from 'bcrypt';
import { omit } from 'lodash';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { getHashedPassword } from 'src/utils';
import { RestaurantService } from 'src/restaurants/restaurants.service';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UploadService } from 'src/upload/upload.service';
import { Request } from 'express';
@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly restaurantService: RestaurantService,
    private readonly uploadService: UploadService,
  ) {}

  private async generateToken(phoneNo: string) {
    return {
      accessToken: await this.jwtService.signAsync(
        { phoneNo },
        {
          secret: this.configService.get('JWT_ADMIN_SECRET'),
          expiresIn: '24h',
        },
      ),
    };
  }

  async validateAdminAccountByPhoneNo(phoneNo: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { phoneNo },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            location: true,
            openDays: true,
            openHour: true,
            closeHour: true,
            slotDurationInMin: true,
            slug: true,
          },
        },
      },
    });
    if (!admin) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return admin;
  }

  async register(registerAdminDto: RegisterAdminDto) {
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { phoneNo: registerAdminDto.phoneNo },
    });

    if (existingAdmin) {
      throw new HttpException(
        'Phone number already in use',
        HttpStatus.CONFLICT,
      );
    }

    const admin = await this.prisma.admin.create({
      data: {
        name: registerAdminDto.name,
        phoneNo: registerAdminDto.phoneNo,
        email: registerAdminDto.email,
        password: getHashedPassword(registerAdminDto.password),
      },
    });
    const restaurant = await this.restaurantService.createRestaurant({
      name: registerAdminDto.restaurantName,
      email: registerAdminDto.email,
    });

    return {
      ...admin,
      restaurant,
    };
  }

  async login(loginAdminDto: LoginAdminDto) {
    const admin = await this.validateAdminAccountByPhoneNo(
      loginAdminDto.phoneNo,
    );
    if (!admin || !compareSync(loginAdminDto.password, admin.password)) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return this.generateToken(admin.phoneNo);
  }

  async me(phoneNo: string) {
    const admin = await this.validateAdminAccountByPhoneNo(phoneNo);
    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    }
    return omit(admin, ['id', 'password', 'createdAt', 'updatedAt']);
  }

  async update(
    phoneNo: string,
    updateAdminDto: UpdateAdminDto,
    profileImg?: Express.Multer.File,
  ) {
    const admin = await this.validateAdminAccountByPhoneNo(phoneNo);
    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    }
    if (!profileImg) {
      delete updateAdminDto.profileImg;
    }
    const updatedAdmin = await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        ...updateAdminDto,
        profileImgUrl: profileImg ? profileImg.path : admin.profileImgUrl,
      },
    });
    return omit(updatedAdmin, ['id', 'password', 'createdAt', 'updatedAt']);
  }

  async changePassword(phoneNo: string, changePasswordDto: ChangePasswordDto) {
    const admin = await this.validateAdminAccountByPhoneNo(phoneNo);
    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    }
    if (!compareSync(changePasswordDto.oldPassword, admin.password)) {
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
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    });
    return { message: 'Password changed successfully' };
  }

  async getInsights(restaurantId: string) {
    const today = new Date();
    const sevenDaysAgo = new Date(new Date().setDate(today.getDate() - 7));
    const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30));

    // 1. Queue Status Distribution
    const queueStatusCounts = await this.prisma.queue.groupBy({
      by: ['status'],
      where: { restaurantId },
      _count: true,
    });

    // 2. Table Utilization
    const tables = await this.prisma.table.findMany({
      where: { restaurantId },
      include: { queues: true },
    });

    // 3. Orders and Revenue
    const recentOrders = await this.prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: sevenDaysAgo },
      },
      include: {
        meals: {
          include: {
            meal: true,
          },
        },
        queue: true,
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 4. Customer Data
    const customerQueues = await this.prisma.queue.findMany({
      where: {
        restaurantId,
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        customer: true,
        orders: {
          include: {
            meals: {
              include: { meal: true },
            },
          },
        },
      },
    });

    // 5. Menu Performance
    const orderMeals = await this.prisma.orderMeal.findMany({
      where: {
        order: { restaurantId },
      },
      include: {
        meal: true,
        order: true,
      },
    });

    // Calculate all insights

    // 1. Queue and Table Analytics
    const queueAnalytics = {
      currentStatus: {
        bookings:
          queueStatusCounts.find((q) => q.status === 'BOOKING')?._count || 0,
        waitlist:
          queueStatusCounts.find((q) => q.status === 'WAITLIST')?._count || 0,
        serving:
          queueStatusCounts.find((q) => q.status === 'SERVING')?._count || 0,
        completed:
          queueStatusCounts.find((q) => q.status === 'COMPLETED')?._count || 0,
      },
      tableUtilization: {
        total: tables.length,
        occupied: tables.filter((t) => t.status === 'RESERVED').length,
        available: tables.filter((t) => t.status === 'AVAILABLE').length,
        utilizationRate:
          (tables.filter((t) => t.status === 'RESERVED').length /
            tables.length) *
          100,
      },
    };

    // 2. Revenue Analytics
    const dailyRevenue = recentOrders.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      const revenue = order.meals.reduce(
        (sum, item) => sum + item.quantity * item.meal.price,
        0,
      );
      acc[date] = (acc[date] || 0) + revenue;
      return acc;
    }, {});

    const revenueAnalytics = {
      dailyRevenue,
      totalRevenue: Object.values(dailyRevenue).reduce(
        (a: number, b: number) => a + b,
        0,
      ),
      averageOrderValue:
        recentOrders.length > 0
          ? recentOrders.reduce(
              (sum, order) =>
                sum +
                order.meals.reduce(
                  (mealSum, item) => mealSum + item.quantity * item.meal.price,
                  0,
                ),
              0,
            ) / recentOrders.length
          : 0,
    };

    // 3. Customer Analytics
    const customerVisits = customerQueues.reduce((acc, queue) => {
      acc[queue.customerId] = (acc[queue.customerId] || 0) + 1;
      return acc;
    }, {});

    const customerAnalytics = {
      totalCustomers: Object.keys(customerVisits).length,
      repeatCustomers: Object.values(customerVisits).filter(
        (visits: number) => visits > 1,
      ).length,
      averagePartySize:
        customerQueues.length > 0
          ? customerQueues.reduce((sum, queue) => sum + queue.partySize, 0) /
            customerQueues.length
          : 0,
      customerRetentionRate:
        Object.keys(customerVisits).length > 0
          ? (Object.values(customerVisits).filter(
              (visits: number) => visits > 1,
            ).length /
              Object.keys(customerVisits).length) *
            100
          : 0,
    };

    // 4. Menu Analytics
    const dishPopularity = orderMeals.reduce((acc, item) => {
      if (!acc[item.mealId]) {
        acc[item.mealId] = {
          name: item.meal.name,
          category: item.meal.category,
          totalOrdered: 0,
          revenue: 0,
        };
      }
      acc[item.mealId].totalOrdered += item.quantity;
      acc[item.mealId].revenue += item.quantity * item.meal.price;
      return acc;
    }, {});

    // Calculate category performance
    const categoryPerformance = Object.values(dishPopularity).reduce(
      (acc, dish: any) => {
        if (!acc[dish.category]) {
          acc[dish.category] = {
            totalOrders: 0,
            revenue: 0,
          };
        }
        acc[dish.category].totalOrders += dish.totalOrdered;
        acc[dish.category].revenue += dish.revenue;
        return acc;
      },
      {},
    );

    // 5. Operational Analytics
    const hourlyDistribution = customerQueues.reduce((acc, queue) => {
      const hour = new Date(queue.createdAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const peakHours = Object.entries(hourlyDistribution)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        count: count as number,
      }));

    return {
      // 1. Queue Status Distribution
      queueStatus: {
        labels: ['Bookings', 'Waitlist', 'Serving', 'Completed'],
        data: [
          queueStatusCounts.find((q) => q.status === 'BOOKING')?._count || 0,
          queueStatusCounts.find((q) => q.status === 'WAITLIST')?._count || 0,
          queueStatusCounts.find((q) => q.status === 'SERVING')?._count || 0,
          queueStatusCounts.find((q) => q.status === 'COMPLETED')?._count || 0,
        ],
      },

      // 2. Table Utilization
      tableUtilization: {
        labels: ['Occupied', 'Available'],
        data: [
          tables.filter((t) => t.status === 'RESERVED').length,
          tables.filter((t) => t.status === 'AVAILABLE').length,
        ],
      },

      // 3. Daily Revenue (Last 7 Days)
      dailyRevenue: {
        labels: Object.keys(dailyRevenue).map((date) =>
          new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        ),
        data: Object.values(dailyRevenue),
      },

      // 4. Popular Dishes
      popularDishes: {
        labels: Object.values(dishPopularity)
          .sort((a: any, b: any) => b.totalOrdered - a.totalOrdered)
          .slice(0, 5)
          .map((dish: any) => dish.name),
        data: Object.values(dishPopularity)
          .sort((a: any, b: any) => b.totalOrdered - a.totalOrdered)
          .slice(0, 5)
          .map((dish: any) => dish.totalOrdered),
      },

      // 5. Category Performance
      categoryPerformance: {
        labels: Object.keys(categoryPerformance),
        data: Object.values(categoryPerformance).map((cat) => cat.totalOrders),
      },

      // 6. Peak Hours
      peakHours: {
        labels: peakHours.map((ph) => ph.hour),
        data: peakHours.map((ph) => ph.count),
      },

      // 7. Customer Retention
      customerRetention: {
        labels: ['New Customers', 'Repeat Customers'],
        data: [
          Object.keys(customerVisits).length -
            Object.values(customerVisits).filter((visits: number) => visits > 1)
              .length,
          Object.values(customerVisits).filter((visits: number) => visits > 1)
            .length,
        ],
      },

      // 8. Average Party Size Distribution
      partySize: {
        labels: ['1-2', '3-4', '5-6', '7+'],
        data: [
          customerQueues.filter((q) => q.partySize <= 2).length,
          customerQueues.filter((q) => q.partySize > 2 && q.partySize <= 4)
            .length,
          customerQueues.filter((q) => q.partySize > 4 && q.partySize <= 6)
            .length,
          customerQueues.filter((q) => q.partySize > 6).length,
        ],
      },
    };
  }
}
