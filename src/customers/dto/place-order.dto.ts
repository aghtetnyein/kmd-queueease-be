import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class MealItemDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '1',
    description: 'The meal id',
  })
  id: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 2,
    description: 'The quantity of the meal',
  })
  count: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 10000,
    description: 'The total price for this meal item',
  })
  totalPrice: number;
}

export class PlaceOrderDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '1',
    description: 'The queue number',
  })
  queueNo: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealItemDto)
  @ApiProperty({
    type: [MealItemDto],
    description: 'Array of meal items in the order',
  })
  meals: MealItemDto[];
}
