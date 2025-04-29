import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'DELIVERED',
    description: 'The status of the order',
  })
  status: string;
}
