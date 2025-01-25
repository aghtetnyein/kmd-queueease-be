import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'libs/helpers/src';
import { ConfigService } from '@nestjs/config';
import { LoginAdminDto } from './dto';
import { compareSync } from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async generateToken(email: string) {
    return {
      accessToken: await this.jwtService.signAsync(
        { email },
        {
          secret: this.configService.get('JWT_ADMIN_SECRET'),
          expiresIn: '24h',
        },
      ),
    };
  }

  async validateAdminAccountByEmail(email: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    }
    return admin;
  }

  async login(loginAdminDto: LoginAdminDto) {
    const admin = await this.validateAdminAccountByEmail(loginAdminDto.email);
    if (!admin || !compareSync(loginAdminDto.password, admin.password)) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return this.generateToken(admin.email);
  }

  async me(email: string) {
    const admin = await this.validateAdminAccountByEmail(email);
    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    }
    return admin;
  }
}
