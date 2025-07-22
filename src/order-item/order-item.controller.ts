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
import { OrderItemService } from './order-item.service';
import { OrderItemEntity } from './order-item.entity/order-item.entity';
import { OrderItemSchema } from './order-item.zod';

@Controller('order-item')
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  @Post()
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
  findAll(): Promise<OrderItemEntity[]> {
    return this.orderItemService.findAll();
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
  remove(@Param('id') id: string): Promise<void> {
    return this.orderItemService.remove(id);
  }
}
