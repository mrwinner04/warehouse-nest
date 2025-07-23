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
import { CompanyService } from './company.service';
import { CompanyEntity } from './company.entity/company.entity';
import { CompanySchema } from './company.zod';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() data: Partial<CompanyEntity>): Promise<CompanyEntity> {
    const result = CompanySchema.safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    const created = await this.companyService.create(result.data);
    return this.companyService.findOne(created.id) as Promise<CompanyEntity>;
  }

  @Get()
  findAll(): Promise<CompanyEntity[]> {
    return this.companyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CompanyEntity | null> {
    return this.companyService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<CompanyEntity>,
  ): Promise<CompanyEntity | null> {
    const result = CompanySchema.partial().safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.companyService.update(id, result.data);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.companyService.remove(id);
  }
}
