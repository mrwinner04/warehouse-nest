import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductEntity } from './product.entity';
import { ProductSchema } from './product.zod';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() data: Partial<ProductEntity>): Promise<ProductEntity> {
    const result = ProductSchema.safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.productService.create(result.data);
  }

  @Get()
  // Add JWT guard if not present
  findAll(
    @Request() req: { user: { companyId: string } },
  ): Promise<ProductEntity[]> {
    return this.productService.findAll(req.user.companyId);
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
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.productService.remove(id);
  }
}
