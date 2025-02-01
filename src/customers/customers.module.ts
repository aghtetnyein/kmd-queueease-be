import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/admins/guards/jwt-auth.guard';
import { CustomerJwtStrategy } from './strategies/customers.jwt.strategy';

@Module({
  imports: [PrismaModule],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    JwtService,
    ConfigService,
    CustomerJwtStrategy,
    JwtAuthGuard,
  ],
})
export class CustomersModule {}
