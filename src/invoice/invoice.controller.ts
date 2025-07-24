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
  Query,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceEntity } from './invoice.entity';
import { InvoiceSchema } from './invoice.zod';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/user.entity';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() data: Partial<InvoiceEntity>): Promise<InvoiceEntity> {
    const result = InvoiceSchema.safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.invoiceService.create(result.data);
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
    return this.invoiceService.findAll(req.user.companyId, pageNum, limitNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<InvoiceEntity | null> {
    return this.invoiceService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<InvoiceEntity>,
  ): Promise<InvoiceEntity | null> {
    const result = InvoiceSchema.partial().safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.invoiceService.update(id, result.data);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.invoiceService.remove(id);
  }

  // Hard delete an invoice by ID (OWNER only)
  @Delete(':id/hard')
  @Roles(UserRole.OWNER)
  @HttpCode(204)
  hardRemove(@Param('id') id: string): Promise<void> {
    return this.invoiceService.hardRemove(id);
  }
}
