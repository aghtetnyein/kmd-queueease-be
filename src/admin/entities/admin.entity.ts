import { ApiProperty } from '@nestjs/swagger';

export class Admin {
  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the admin',
  })
  name: string;

  @ApiProperty({
    example: 'admin@queueease.com',
    description: 'The email of the admin',
  })
  email: string;

  @ApiProperty({
    example: 'password',
    description: 'The password of the admin',
  })
  password: string;

  @ApiProperty({
    example: '0612345678',
    description: 'The phone number of the admin',
  })
  phoneNo: string;

  @ApiProperty({
    example: 'ADMIN',
    description: 'The role of the admin',
  })
  role: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'The date and time the admin was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'The date and time the admin was last updated',
  })
  updatedAt: Date;
}
