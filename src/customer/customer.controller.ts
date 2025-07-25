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
import { CustomerService } from './customer.service';
import { CustomerEntity } from './customer.entity';
import { CustomerSchema } from './customer.zod';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { Roles } from '../decorator/roles.decorator';
import { UserRole } from '../user/user.entity';
import { ZodValidationPipe } from '../zod.validation.pipe';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(CustomerSchema))
  async create(
    @Body() data: Partial<CustomerEntity>,
    @Request() req: { user: { companyId: string } },
  ): Promise<CustomerEntity> {
    const customerData = { ...data, companyId: req.user.companyId };
    return this.customerService.create(customerData);
  }

  @Get()
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
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<CustomerEntity> {
    return this.customerService.findOne(id, req.user.companyId);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(CustomerSchema.partial()))
  async update(
    @Param('id') id: string,
    @Body() data: Partial<CustomerEntity>,
    @Request() req: { user: { companyId: string } },
  ): Promise<CustomerEntity> {
    const customerData = { ...data, companyId: req.user.companyId };
    return this.customerService.update(id, customerData, req.user.companyId);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.customerService.remove(id, req.user.companyId);
  }

  @Delete(':id/hard')
  @Roles(UserRole.OWNER)
  @HttpCode(204)
  hardRemove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.customerService.hardRemove(id, req.user.companyId);
  }
}
