import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GenerateDemoDataDto {
  @ApiProperty({
    description: 'Company ID to generate demo data for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  companyId: string;
}

export class DemoDataResponseDto {
  @ApiProperty({
    description: 'Array of created product IDs',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  products: string[];

  @ApiProperty({
    description: 'Array of created warehouse IDs',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  warehouses: string[];

  @ApiProperty({
    description: 'Array of created customer IDs',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  customers: string[];

  @ApiProperty({
    description: 'Array of created order IDs',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  orders: string[];

  @ApiProperty({
    description: 'Array of created order item IDs',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  orderItems: string[];
}
