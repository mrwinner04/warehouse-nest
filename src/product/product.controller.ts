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
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductEntity } from './product.entity';
import { ProductSchema } from './product.zod';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/user.entity';

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
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
    @Query('code') code?: string,
  ) {
    // Parse pagination params
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.productService.findAll(req.user.companyId, pageNum, limitNum, {
      name,
      code,
    });
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

  // Hard delete a product by ID (OWNER only)
  @Delete(':id/hard')
  @Roles(UserRole.OWNER)
  @HttpCode(204)
  hardRemove(@Param('id') id: string): Promise<void> {
    return this.productService.hardRemove(id);
  }
}
