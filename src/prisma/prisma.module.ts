import { Module } from '@nestjs/common';
import { PrismaService } from 'libs/helpers/src';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
