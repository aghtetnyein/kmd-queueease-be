import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QueueStatus, QueueProgressStatus } from '@prisma/client';

export class UpdateQueueStatusDto {
  @IsOptional()
  @IsMongoId()
  @ApiProperty({
    example: '123',
    description: 'The table id of the queue',
    required: false,
  })
  tableId?: string;

  @IsOptional()
  @IsEnum(QueueStatus)
  @ApiProperty({
    example: 'BOOKING',
    description: 'The status of the queue',
    enum: QueueStatus,
    required: false,
  })
  status?: QueueStatus;

  @IsOptional()
  @IsEnum(QueueProgressStatus)
  @ApiProperty({
    example: 'PENDING',
    description: 'The progress status of the queue',
    enum: QueueProgressStatus,
    required: false,
  })
  progressStatus?: QueueProgressStatus;
}
