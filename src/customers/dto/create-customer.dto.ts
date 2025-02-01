import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Miya',
    description: 'The name of the customer',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '0621482334',
    description: 'The phone number of the customer',
  })
  phoneNo: string;
}
