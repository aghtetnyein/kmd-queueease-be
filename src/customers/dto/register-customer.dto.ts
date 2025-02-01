import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterNewCustomerDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '0621482333',
    description: 'The phone number of the customer',
  })
  phoneNo: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Emilia',
    description: 'The name of the customer',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({
    example: 'emilia@queueease.com',
    description: 'The email of the customer',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'password',
    description: 'The password of the customer',
  })
  password: string;
}

export class RegisterExistingCustomerDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '0621482332',
    description: 'The phone number of the customer',
  })
  phoneNo: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'customer@queueease.com',
    description: 'The email of the customer',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'password',
    description: 'The password of the customer',
  })
  password: string;
}
