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
import { OrderItemService } from './order-item.service';
import { OrderItemEntity } from './order-item.entity';
import { OrderItemSchema } from './order-item.zod';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/user.entity';

@Controller('order-item')
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body() data: Partial<OrderItemEntity>,
  ): Promise<OrderItemEntity> {
    const result = OrderItemSchema.safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.orderItemService.create(result.data);
  }

  @Get()
  // Add JWT guard if not present
  findAll(
    @Request() req: { user: { companyId: string } },
  ): Promise<OrderItemEntity[]> {
    return this.orderItemService.findAll(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<OrderItemEntity | null> {
    return this.orderItemService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<OrderItemEntity>,
  ): Promise<OrderItemEntity | null> {
    const result = OrderItemSchema.safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.orderItemService.update(id, result.data);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.orderItemService.remove(id);
  }

  // Hard delete an order item by ID (OWNER only)
  @Delete(':id/hard')
  @Roles(UserRole.OWNER)
  @HttpCode(204)
  hardRemove(@Param('id') id: string): Promise<void> {
    return this.orderItemService.hardRemove(id);
  }
}
