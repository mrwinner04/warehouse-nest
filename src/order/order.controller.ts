import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Request,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderEntity } from './order.entity';
import { OrderSchema } from './order.zod';
import { BadRequestException } from '@nestjs/common';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() data: Partial<OrderEntity>): Promise<OrderEntity> {
    const result = OrderSchema.safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.orderService.create(result.data);
  }

  @Get()
  // Add JWT guard if not present
  findAll(
    @Request() req: { user: { companyId: string } },
  ): Promise<OrderEntity[]> {
    return this.orderService.findAll(req.user.companyId);
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
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.orderService.remove(id);
  }
}
