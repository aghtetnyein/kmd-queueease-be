import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomersService } from '../customers.service';

interface JwtPayload {
  phoneNo: string;
}

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-customer',
) {
  constructor(
    private readonly customersService: CustomersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_CUSTOMER_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const customer =
      await this.customersService.validateCustomerAccountByPhoneNo(
        payload.phoneNo,
      );
    if (!customer) {
      throw new UnauthorizedException('Invalid token or user not found');
    }
    return customer;
  }
}
