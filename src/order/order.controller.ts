import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Request,
  Query,
  UsePipes,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderEntity } from './order.entity';
import { OrderSchema } from './order.zod';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { Roles } from '../decorator/roles.decorator';
import { UserRole } from '../user/user.entity';
import { ZodValidationPipe } from '../zod.validation.pipe';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(OrderSchema))
  async create(
    @Body() data: Partial<OrderEntity>,
    @Request() req: { user: { companyId: string } },
  ): Promise<OrderEntity> {
    const orderData = { ...data, companyId: req.user.companyId };
    return this.orderService.create(orderData);
  }

  @Get()
  findAll(
    @Request() req: { user: { companyId: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.orderService.findAll(req.user.companyId, pageNum, limitNum);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<OrderEntity> {
    return this.orderService.findOne(id, req.user.companyId);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(OrderSchema.partial()))
  async update(
    @Param('id') id: string,
    @Body() data: Partial<OrderEntity>,
    @Request() req: { user: { companyId: string } },
  ): Promise<OrderEntity> {
    const orderData = { ...data, companyId: req.user.companyId };
    return this.orderService.update(id, orderData, req.user.companyId);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.orderService.remove(id, req.user.companyId);
  }

  // Hard delete an order by ID (OWNER only)
  @Delete(':id/hard')
  @Roles(UserRole.OWNER)
  @HttpCode(204)
  hardRemove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.orderService.hardRemove(id, req.user.companyId);
  }
}
