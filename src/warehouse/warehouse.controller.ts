import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  BadRequestException,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseEntity } from './warehouse.entity';
import { WarehouseSchema } from './warehouse.zod';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/user.entity';

@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @HttpCode(204)
  async create(
    @Body() data: Partial<WarehouseEntity>,
  ): Promise<WarehouseEntity> {
    const result = WarehouseSchema.safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.warehouseService.create(result.data);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
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
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<WarehouseEntity> {
    return this.warehouseService.findOne(id, req.user.companyId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<WarehouseEntity>,
    @Request() req: { user: { companyId: string } },
  ): Promise<WarehouseEntity> {
    const result = WarehouseSchema.partial().safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.warehouseService.update(id, result.data, req.user.companyId);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.warehouseService.remove(id, req.user.companyId);
  }

  // Hard delete a warehouse by ID (OWNER only)
  @Delete(':id/hard')
  @Roles(UserRole.OWNER)
  @HttpCode(204)
  hardRemove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.warehouseService.hardRemove(id, req.user.companyId);
  }
}
