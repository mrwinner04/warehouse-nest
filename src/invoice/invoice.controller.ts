import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Request,
  Query,
  UsePipes,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceEntity } from './invoice.entity';
import { InvoiceSchema } from './invoice.zod';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { Roles } from '../decorator/roles.decorator';
import { UserRole } from '../user/user.entity';
import { ZodValidationPipe } from '../zod.validation.pipe';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(InvoiceSchema))
  async create(
    @Body() data: Partial<InvoiceEntity>,
    @Request() req: { user: { companyId: string } },
  ): Promise<InvoiceEntity> {
    const invoiceData = { ...data, companyId: req.user.companyId };
    return this.invoiceService.create(invoiceData);
  }

  @Get()
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
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<InvoiceEntity> {
    return this.invoiceService.findOne(id, req.user.companyId);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(InvoiceSchema.partial()))
  async update(
    @Param('id') id: string,
    @Body() data: Partial<InvoiceEntity>,
    @Request() req: { user: { companyId: string } },
  ): Promise<InvoiceEntity> {
    const invoiceData = { ...data, companyId: req.user.companyId };
    return this.invoiceService.update(id, invoiceData, req.user.companyId);
  }

  @Delete(':id')
  @Roles(UserRole.OPERATOR)
  @HttpCode(204)
  remove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.invoiceService.remove(id, req.user.companyId);
  }

  // Hard delete an invoice by ID (OWNER only)
  @Delete(':id/hard')
  @Roles(UserRole.OWNER)
  @HttpCode(204)
  hardRemove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.invoiceService.hardRemove(id, req.user.companyId);
  }
}
