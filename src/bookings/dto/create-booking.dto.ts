import {
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
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
  @IsMongoId()
  @ApiProperty({
    example: '1234567890',
    description: 'The ID of the customer',
  })
  customerId: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 4,
    description: 'The size of the party',
  })
  partySize: number;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty({
    example: '2025-03-31T10:00:00.000Z',
    description: 'The time slot of the booking',
  })
  timeSlot: Date;
}
