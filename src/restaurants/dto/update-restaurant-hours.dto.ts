import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateRestaurantOpenHoursDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '10:00',
    description: 'The open hour of the restaurant',
  })
  openHour: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '22:00',
    description: 'The close hour of the restaurant',
  })
  closeHour: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 30,
    description: 'The duration of the slot in minutes',
  })
  slotDurationInMin: number;
}
