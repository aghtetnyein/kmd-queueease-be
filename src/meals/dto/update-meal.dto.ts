import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateMealDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Burger',
    description: 'The name of the meal',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '10.00',
    description: 'The price of the meal',
  })
  price: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Fast Food',
    description: 'The category of the meal',
  })
  category: string;
}
