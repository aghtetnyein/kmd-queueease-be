import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginCustomerDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '0621481902',
    description: 'The phone number of the customer',
  })
  phoneNo: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '$0meTimes1999',
    description: 'The password of the customer',
  })
  password: string;
}
