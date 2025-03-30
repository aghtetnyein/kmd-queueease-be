import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/admins/guards/jwt-auth.guard';

@Module({
  imports: [PrismaModule],
  controllers: [TablesController],
  providers: [TablesService, JwtService, ConfigService, JwtAuthGuard],
})
export class TablesModule {}
