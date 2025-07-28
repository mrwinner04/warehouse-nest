import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsEnum,
  IsDate,
  IsArray,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderType {
  SALES = 'sales',
  PURCHASE = 'purchase',
  TRANSFER = 'transfer',
}

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 5,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Price per unit',
    example: '29.99',
  })
  @IsString()
  price: string;
}

export class CreateOrderWithItemsDto {
  @ApiProperty({
    description:
      'Order number (optional - will be auto-generated if not provided)',
    example: 'ORD-2024-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiProperty({
    description: 'Order type',
    enum: OrderType,
    example: OrderType.SALES,
  })
  @IsEnum(OrderType)
  type: OrderType;

  @ApiProperty({
    description: 'Customer ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  customerId: string;

  @ApiProperty({
    description: 'Warehouse ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  warehouseId: string;

  @ApiProperty({
    description: 'Order date (optional - defaults to current date)',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;

  @ApiProperty({
    description: 'Order items',
    type: [CreateOrderItemDto],
    example: [
      {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 5,
        price: '29.99',
      },
      {
        productId: '456e7890-e89b-12d3-a456-426614174000',
        quantity: 2,
        price: '15.50',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];
}

export class OrderItemResponseDto {
  @ApiProperty({
    description: 'Order item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  productId: string;

  @ApiProperty({
    description: 'Quantity',
    example: 5,
  })
  quantity: number;

  @ApiProperty({
    description: 'Price per unit',
    example: '29.99',
  })
  price: string;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'Order ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Order number',
    example: 'ORD-2024-001',
  })
  number: string;

  @ApiProperty({
    description: 'Order type',
    enum: ['sales', 'purchase', 'transfer'],
    example: 'sales',
  })
  type: 'sales' | 'purchase' | 'transfer';

  @ApiProperty({
    description: 'Customer ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  customerId: string;

  @ApiProperty({
    description: 'Warehouse ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  warehouseId: string;

  @ApiProperty({
    description: 'Order date',
    example: '2024-01-15T10:30:00Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Order items',
    type: [OrderItemResponseDto],
  })
  orderItems: OrderItemResponseDto[];
}
