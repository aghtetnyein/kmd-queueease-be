import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AdminService } from '../admins.service';

interface JwtPayload {
  phoneNo: string;
}

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ADMIN_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const admin = await this.adminService.validateAdminAccountByPhoneNo(
      payload.phoneNo,
    );
    if (!admin) {
      throw new UnauthorizedException('Invalid token or user not found');
    }
    return admin;
  }
}
