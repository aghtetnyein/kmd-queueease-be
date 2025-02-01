import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterAdminDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({
    example: 'admin@queueease.com',
    description: 'The email of the admin',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'password',
    description: 'The password of the admin',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the admin',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '1234567890',
    description: 'The phone number of the admin',
  })
  phoneNo: string;
}
