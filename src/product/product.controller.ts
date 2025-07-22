import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductEntity } from './product.entity/product.entity';
import { ProductSchema } from './product.zod';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() data: Partial<ProductEntity>): Promise<ProductEntity> {
    const result = ProductSchema.safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.productService.create(result.data);
  }

  @Get()
  findAll(): Promise<ProductEntity[]> {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProductEntity | null> {
    return this.productService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<ProductEntity>,
  ): Promise<ProductEntity | null> {
    const result = ProductSchema.partial().safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.productService.update(id, result.data);
  }

  // Soft delete a product by ID
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.productService.remove(id);
  }
}
