import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderEntity } from './order.entity/order.entity';
import { OrderSchema } from './order.zod';
import { BadRequestException } from '@nestjs/common';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() data: Partial<OrderEntity>): Promise<OrderEntity> {
    const result = OrderSchema.safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.orderService.create(result.data);
  }

  @Get()
  findAll(): Promise<OrderEntity[]> {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<OrderEntity | null> {
    return this.orderService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<OrderEntity>,
  ): Promise<OrderEntity | null> {
    const result = OrderSchema.partial().safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.orderService.update(id, result.data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.orderService.remove(id);
  }
}
