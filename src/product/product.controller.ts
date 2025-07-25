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
import {
  BestsellingProduct,
  ClientWithMostOrders,
  ProductWithHighestStock,
} from './product.reports';
import { ProductReportService } from './product.report.service';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productReportService: ProductReportService,
  ) {}

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
  findAll(
    @Request() req: { user: { companyId: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
    @Query('code') code?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.productService.findAll(req.user.companyId, pageNum, limitNum, {
      name,
      code,
    });
  }

  @Get('bestselling')
  getBestsellingProducts(
    @Request() req: { user: { companyId: string } },
    @Query('limit') limit?: string,
  ): Promise<BestsellingProduct[]> {
    const lim = limit ? parseInt(limit, 10) : 10;
    return this.productReportService.getBestsellingProducts(
      req.user.companyId,
      lim,
    );
  }

  @Get('client-with-most-orders')
  getClientWithMostOrders(
    @Request() req: { user: { companyId: string } },
  ): Promise<ClientWithMostOrders | undefined> {
    return this.productReportService.getClientWithMostOrders(
      req.user.companyId,
    );
  }

  @Get('highest-stock-per-warehouse')
  getProductWithHighestStockPerWarehouse(
    @Request() req: { user: { companyId: string } },
  ): Promise<ProductWithHighestStock[]> {
    return this.productReportService.getProductWithHighestStockPerWarehouse(
      req.user.companyId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<ProductEntity> {
    return this.productService.findOne(id, req.user.companyId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<ProductEntity>,
    @Request() req: { user: { companyId: string } },
  ): Promise<ProductEntity> {
    const result = ProductSchema.partial().safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.productService.update(id, result.data, req.user.companyId);
  }

  // Soft delete a product by ID
  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.productService.remove(id, req.user.companyId);
  }

  // Hard delete a product by ID (OWNER only)
  @Delete(':id/hard')
  @Roles(UserRole.OWNER)
  @HttpCode(204)
  hardRemove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.productService.hardRemove(id, req.user.companyId);
  }
}
