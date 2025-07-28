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
import { WarehouseService } from './warehouse.service';
import { WarehouseEntity } from './warehouse.entity';
import { WarehouseSchema } from './warehouse.zod';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { Roles } from '../decorator/roles.decorator';
import { UserRole } from '../user/user.entity';
import { ZodValidationPipe } from '../zod.validation.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Warehouses')
@ApiBearerAuth('access-token')
@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(WarehouseSchema))
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiResponse({
    status: 201,
    description: 'Warehouse created successfully',
    type: WarehouseEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async create(
    @Body() data: Partial<WarehouseEntity>,
    @Request() req: { user: { companyId: string } },
  ): Promise<WarehouseEntity> {
    const warehouseData = { ...data, companyId: req.user.companyId };
    return this.warehouseService.create(warehouseData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all warehouses with pagination' })
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
  @ApiResponse({
    status: 200,
    description: 'Warehouses retrieved successfully',
    type: [WarehouseEntity],
  })
  findAll(
    @Request() req: { user: { companyId: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.warehouseService.findAll(req.user.companyId, pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific warehouse by ID' })
  @ApiParam({ name: 'id', description: 'Warehouse ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse retrieved successfully',
    type: WarehouseEntity,
  })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<WarehouseEntity> {
    return this.warehouseService.findOne(id, req.user.companyId);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(WarehouseSchema.partial()))
  @ApiOperation({ summary: 'Update a warehouse' })
  @ApiParam({ name: 'id', description: 'Warehouse ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse updated successfully',
    type: WarehouseEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<WarehouseEntity>,
    @Request() req: { user: { companyId: string } },
  ): Promise<WarehouseEntity> {
    const warehouseData = { ...data, companyId: req.user.companyId };
    return this.warehouseService.update(id, warehouseData, req.user.companyId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Soft delete a warehouse' })
  @ApiParam({ name: 'id', description: 'Warehouse ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'Warehouse deleted successfully' })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  remove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.warehouseService.remove(id, req.user.companyId);
  }

  @Roles(UserRole.OWNER)
  @Delete(':id/hard')
  @HttpCode(204)
  @ApiOperation({ summary: 'Hard delete a warehouse (OWNER only)' })
  @ApiParam({ name: 'id', description: 'Warehouse ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'Warehouse permanently deleted' })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  hardRemove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.warehouseService.hardRemove(id, req.user.companyId);
  }
}
