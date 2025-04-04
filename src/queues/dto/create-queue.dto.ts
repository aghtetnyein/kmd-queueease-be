import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQueueDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  @ApiProperty({
    example: '1234567890',
    description: 'The ID of the restaurant',
  })
  restaurantId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '1234567890',
    description: 'The phone number of the customer',
  })
  phoneNo: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '1234567890',
    description: 'The name of the customer',
  })
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 4,
    description: 'The size of the party',
  })
  partySize: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '2025-03-31T10:00:00.000Z',
    description: 'The selected time slot of the queue',
  })
  selectedSlot?: string;

  @IsNotEmpty()
  @IsEnum(['BOOKING', 'WAITLIST'])
  @ApiProperty({
    example: 'BOOKING',
    description: 'The type of the queue',
  })
  queueType: 'BOOKING' | 'WAITLIST';
}
