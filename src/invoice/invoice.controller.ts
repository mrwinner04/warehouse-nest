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
import { InvoiceService } from './invoice.service';
import { InvoiceEntity } from './invoice.entity/invoice.entity';
import { InvoiceSchema } from './invoice.zod';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';

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
  findAll(): Promise<InvoiceEntity[]> {
    return this.invoiceService.findAll();
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
}
