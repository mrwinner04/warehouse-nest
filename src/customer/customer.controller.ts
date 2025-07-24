import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  BadRequestException,
  Put,
  Request,
  Query,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerEntity } from './customer.entity/customer.entity';
import { CustomerSchema } from './customer.zod';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/user.entity';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() data: Partial<CustomerEntity>): Promise<CustomerEntity> {
    const result = CustomerSchema.safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.customerService.create(result.data);
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
    return this.customerService.findAll(req.user.companyId, pageNum, limitNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CustomerEntity | null> {
    return this.customerService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<CustomerEntity>,
  ): Promise<CustomerEntity | null> {
    const result = CustomerSchema.partial().safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.customerService.update(id, result.data);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.customerService.remove(id);
  }

  // Hard delete a customer by ID (OWNER only)
  @Delete(':id/hard')
  @Roles(UserRole.OWNER)
  @HttpCode(204)
  hardRemove(@Param('id') id: string): Promise<void> {
    return this.customerService.hardRemove(id);
  }
}
