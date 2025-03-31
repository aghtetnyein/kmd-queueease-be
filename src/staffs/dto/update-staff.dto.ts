import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateStaffDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the staff',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '0123456789',
    description: 'The phone number of the staff',
  })
  phoneNo: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'WAITER',
    description: 'The role of the staff',
  })
  role: string;
}
