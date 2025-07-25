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
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderEntity } from './order.entity';
import { OrderSchema } from './order.zod';
import { BadRequestException } from '@nestjs/common';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/user.entity';

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
  async update(
    @Param('id') id: string,
    @Body() data: Partial<OrderEntity>,
    @Request() req: { user: { companyId: string } },
  ): Promise<OrderEntity> {
    const result = OrderSchema.partial().safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.orderService.update(id, result.data, req.user.companyId);
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
