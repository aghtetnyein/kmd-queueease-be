import { Module, forwardRef } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/admins/guards/jwt-auth.guard';
import { QueueModule } from 'src/queues/queue.module';

@Module({
  imports: [PrismaModule, forwardRef(() => QueueModule)],
  controllers: [TablesController],
  providers: [TablesService, JwtService, ConfigService, JwtAuthGuard],
  exports: [TablesService],
})
export class TablesModule {}
