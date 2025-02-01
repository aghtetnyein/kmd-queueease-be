import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class CreateRestaurantDto {
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

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({
    example: 'admin@queueease.com',
    description: 'The email of the admin associated with the restaurant',
  })
  email: string;
}
