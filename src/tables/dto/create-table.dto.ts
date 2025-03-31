import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateTableDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Restaurant ID',
    description: 'The ID of the restaurant',
  })
  restaurantId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'A1',
    description: 'The number of the table',
  })
  tableNo: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 4,
    description: 'The size of the table',
  })
  tableSize: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'AVAILABLE',
    description: 'The status of the table',
  })
  status: string;
}
