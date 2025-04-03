import { Module, forwardRef } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/admins/guards/jwt-auth.guard';
import { TablesModule } from 'src/tables/tables.module';

@Module({
  imports: [PrismaModule, forwardRef(() => TablesModule)],
  controllers: [QueueController],
  providers: [QueueService, JwtService, ConfigService, JwtAuthGuard],
  exports: [QueueService],
})
export class QueueModule {}
