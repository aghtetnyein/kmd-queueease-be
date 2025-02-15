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

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly restaurantService: RestaurantService,
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
            qrCode: true,
            sharedLink: true,
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

  async update(phoneNo: string, updateAdminDto: UpdateAdminDto) {
    const admin = await this.validateAdminAccountByPhoneNo(phoneNo);
    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    }
    const updatedAdmin = await this.prisma.admin.update({
      where: { id: admin.id },
      data: updateAdminDto,
    });
    return omit(updatedAdmin, ['id', 'password', 'createdAt', 'updatedAt']);
  }
}
