import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  BadRequestException,
  Put,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerEntity } from './customer.entity/customer.entity';
import { CustomerSchema } from './customer.zod';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';

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
  findAll(): Promise<CustomerEntity[]> {
    return this.customerService.findAll();
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
}
