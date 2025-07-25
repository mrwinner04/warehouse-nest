import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Request,
  UsePipes,
} from '@nestjs/common';
import { OrderItemService } from './order-item.service';
import { OrderItemEntity } from './order-item.entity';
import { OrderItemSchema } from './order-item.zod';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { Roles } from '../decorator/roles.decorator';
import { UserRole } from '../user/user.entity';
import { ZodValidationPipe } from '../zod.validation.pipe';

@Controller('order-item')
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(OrderItemSchema))
  async create(
    @Body() data: Partial<OrderItemEntity>,
  ): Promise<OrderItemEntity> {
    return this.orderItemService.create(data);
  }

  @Get()
  findAll(
    @Request() req: { user: { companyId: string } },
  ): Promise<OrderItemEntity[]> {
    return this.orderItemService.findAll(req.user.companyId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<OrderItemEntity> {
    return this.orderItemService.findOne(id, req.user.companyId);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(OrderItemSchema.partial()))
  async update(
    @Param('id') id: string,
    @Body() data: Partial<OrderItemEntity>,
    @Request() req: { user: { companyId: string } },
  ): Promise<OrderItemEntity> {
    return this.orderItemService.update(id, data, req.user.companyId);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.orderItemService.remove(id, req.user.companyId);
  }

  // Hard delete an order item by ID (OWNER only)
  @Delete(':id/hard')
  @Roles(UserRole.OWNER)
  @HttpCode(204)
  hardRemove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.orderItemService.hardRemove(id, req.user.companyId);
  }
}
