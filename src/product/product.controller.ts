import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Request,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductEntity } from './product.entity';
import { ProductSchema } from './product.zod';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { Roles } from '../decorator/roles.decorator';
import { UserRole } from '../user/user.entity';
import {
  BestsellingProduct,
  ClientWithMostOrders,
  ProductWithHighestStock,
} from './report/product.reports';
import { ProductReportService } from './report/product.report.service';
import { ZodValidationPipe } from '../zod.validation.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  BestsellingQueryDto,
  ProductResponseDto,
  BestsellingProductDto,
  ProductWithHighestStockDto,
} from './dto/product.dto';
import { IdParamDto } from '../common/dto/base.dto';

@ApiTags('Products')
@ApiBearerAuth('access-token')
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productReportService: ProductReportService,
  ) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(ProductSchema))
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async create(
    @Body() data: CreateProductDto,
    @Request() req: { user: { companyId: string } },
  ): Promise<ProductEntity> {
    const productData = { ...data, companyId: req.user.companyId };
    return this.productService.create(productData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination and filtering' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: String,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: String,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by name',
  })
  @ApiQuery({
    name: 'code',
    required: false,
    type: String,
    description: 'Filter by code',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: [ProductResponseDto],
  })
  findAll(
    @Request() req: { user: { companyId: string } },
    @Query() query: ProductQueryDto,
  ) {
    const pageNum = query.page ? parseInt(query.page, 10) : 1;
    const limitNum = query.limit ? parseInt(query.limit, 10) : 20;
    return this.productService.findAll(req.user.companyId, pageNum, limitNum, {
      name: query.name,
      code: query.code,
    });
  }

  @Get('bestselling')
  @ApiOperation({ summary: 'Get bestselling products by quantity sold' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: String,
    description: 'Number of products to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Bestselling products retrieved successfully',
    type: [BestsellingProductDto],
  })
  getBestsellingProducts(
    @Request() req: { user: { companyId: string } },
    @Query() query: BestsellingQueryDto,
  ): Promise<BestsellingProduct[]> {
    const lim = query.limit ? parseInt(query.limit, 10) : 10;
    return this.productReportService.getBestsellingProducts(
      req.user.companyId,
      lim,
    );
  }

  @Get('client-with-most-orders')
  @ApiOperation({ summary: 'Get client with the most orders' })
  @ApiResponse({
    status: 200,
    description: 'Client with most orders retrieved successfully',
    type: Object, // TODO: Create proper DTO for this
  })
  getClientWithMostOrders(
    @Request() req: { user: { companyId: string } },
  ): Promise<ClientWithMostOrders | undefined> {
    return this.productReportService.getClientWithMostOrders(
      req.user.companyId,
    );
  }

  //global company id dekorator

  @Get('highest-stock-per-warehouse')
  @ApiOperation({ summary: 'Get products with highest stock per warehouse' })
  @ApiResponse({
    status: 200,
    description: 'Products with highest stock retrieved successfully',
    type: [ProductWithHighestStockDto],
  })
  getProductWithHighestStockPerWarehouse(
    @Request() req: { user: { companyId: string } },
  ): Promise<ProductWithHighestStock[]> {
    return this.productReportService.getProductWithHighestStockPerWarehouse(
      req.user.companyId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(
    @Param() params: IdParamDto,
    @Request() req: { user: { companyId: string } },
  ): Promise<ProductEntity> {
    return this.productService.findOne(params.id, req.user.companyId);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(ProductSchema.partial()))
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param() params: IdParamDto,
    @Body() data: UpdateProductDto,
    @Request() req: { user: { companyId: string } },
  ): Promise<ProductEntity> {
    // Always use companyId from JWT, ignore any in body
    const productData = { ...data, companyId: req.user.companyId };
    return this.productService.update(
      params.id,
      productData,
      req.user.companyId,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Soft delete a product' })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(
    @Param() params: IdParamDto,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.productService.remove(params.id, req.user.companyId);
  }

  @Roles(UserRole.OWNER)
  @Delete(':id/hard')
  @HttpCode(204)
  @ApiOperation({ summary: 'Hard delete a product (OWNER only)' })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'Product permanently deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  hardRemove(
    @Param() params: IdParamDto,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.productService.hardRemove(params.id, req.user.companyId);
  }
}
