import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  Query,
  UsePipes,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseEntity } from './warehouse.entity';
import { WarehouseSchema } from './warehouse.zod';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/user.entity';
import { ZodValidationPipe } from '../zod.validation.pipe';

@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @HttpCode(204)
  @UsePipes(new ZodValidationPipe(WarehouseSchema))
  async create(
    @Body() data: Partial<WarehouseEntity>,
    @Request() req: { user: { companyId: string } },
  ): Promise<WarehouseEntity> {
    const warehouseData = { ...data, companyId: req.user.companyId };
    return this.warehouseService.create(warehouseData);
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
  @UsePipes(new ZodValidationPipe(WarehouseSchema.partial()))
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
