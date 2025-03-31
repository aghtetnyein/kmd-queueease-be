import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class UpdateRestaurantOpenDaysDto {
  @IsNotEmpty()
  @IsArray()
  @ApiProperty({
    example: [1, 2, 3, 4, 5, 6, 7],
    description: 'The days of the week the restaurant is open',
  })
  openDays: number[];
}
