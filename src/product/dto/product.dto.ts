import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ProductType {
  SOLID = 'solid',
  LIQUID = 'liquid',
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Premium Widget',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Product code/sku',
    example: 'WID-001',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Product price',
    example: '29.99',
    minimum: 0,
  })
  @IsString()
  price: string;

  @ApiProperty({
    description: 'Product type',
    enum: ProductType,
    example: ProductType.SOLID,
  })
  @IsEnum(ProductType)
  type: ProductType;
}

export class UpdateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Premium Widget Pro',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Product code/sku',
    example: 'WID-002',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'Product price',
    example: '39.99',
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiProperty({
    description: 'Product type',
    enum: ProductType,
    example: ProductType.SOLID,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;
}

export class ProductQueryDto {
  @ApiProperty({
    description: 'Page number (starts from 1)',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    required: false,
    default: 20,
  })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiProperty({
    description: 'Filter by product name (partial match)',
    example: 'widget',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Filter by product code (partial match)',
    example: 'WID',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;
}

export class BestsellingQueryDto {
  @ApiProperty({
    description: 'Number of bestselling products to return',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @IsString()
  limit?: string;
}

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Company ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  companyId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Premium Widget',
  })
  name: string;

  @ApiProperty({
    description: 'Product code/sku',
    example: 'WID-001',
  })
  code: string;

  @ApiProperty({
    description: 'Product price',
    example: 29.99,
  })
  price: number;

  @ApiProperty({
    description: 'Product type',
    enum: ProductType,
    example: ProductType.SOLID,
  })
  type: ProductType;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-07-24T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-07-24T10:30:00.000Z',
  })
  updatedAt: Date;
}

export class BestsellingProductDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  productId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Premium Widget',
  })
  productName: string;

  @ApiProperty({
    description: 'Total quantity sold',
    example: 150,
  })
  totalQuantity: number;
}

export class ProductWithHighestStockDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  productId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Premium Widget',
  })
  productName: string;

  @ApiProperty({
    description: 'Warehouse ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  warehouseId: string;

  @ApiProperty({
    description: 'Warehouse name',
    example: 'Main Warehouse',
  })
  warehouseName: string;

  @ApiProperty({
    description: 'Stock quantity',
    example: 500,
  })
  stockQuantity: number;
}
