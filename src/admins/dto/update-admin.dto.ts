import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAdminDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '0621481905',
    description: 'The phone number of the admin',
  })
  phoneNo: string;

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
    example: 'John Doe',
    description: 'The name of the admin',
  })
  name: string;
}
