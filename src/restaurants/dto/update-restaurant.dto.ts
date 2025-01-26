import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRestaurantDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Restaurant Name',
    description: 'The name of the restaurant',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Restaurant Location',
    description: 'The location of the restaurant',
  })
  location: string;
}
