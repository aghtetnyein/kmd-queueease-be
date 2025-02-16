import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAdminDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '0621481906',
    description: 'The phone number of the admin',
  })
  phoneNo: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '$0meTimes1999',
    description: 'The password of the admin',
  })
  password: string;
}
