import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCustomerDto {
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
    example: 'John Doe',
    description: 'The name of the customer',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the customer',
  })
  email: string;
}
