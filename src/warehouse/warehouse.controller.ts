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
import { WarehouseService } from './warehouse.service';
import { WarehouseEntity } from './warehouse.entity/warehouse.entity';
import { WarehouseSchema } from './warehouse.zod';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';

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
  findAll(): Promise<WarehouseEntity[]> {
    return this.warehouseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<WarehouseEntity | null> {
    return this.warehouseService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<WarehouseEntity>,
  ): Promise<WarehouseEntity | null> {
    const result = WarehouseSchema.partial().safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.warehouseService.update(id, result.data);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.warehouseService.remove(id);
  }
}
