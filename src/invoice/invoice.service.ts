import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceEntity } from './invoice.entity';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
  ) {}

  async create(data: Partial<InvoiceEntity>): Promise<InvoiceEntity> {
    const existing = await this.invoiceRepository.findOneBy({
      companyId: data.companyId,
      number: data.number,
    });
    if (existing) {
      throw new BadRequestException(
        'An invoice with this number already exists for this company',
      );
    }
    if (!data.date) {
      data.date = new Date();
    }
    const invoice = this.invoiceRepository.create(data);
    return this.invoiceRepository.save(invoice);
  }

  findAll(companyId: string): Promise<InvoiceEntity[]> {
    return this.invoiceRepository.find({ where: { companyId } });
  }

  findOne(id: string): Promise<InvoiceEntity | null> {
    return this.invoiceRepository.findOneBy({ id });
  }

  async update(
    id: string,
    data: Partial<InvoiceEntity>,
  ): Promise<InvoiceEntity | null> {
    const existing = await this.invoiceRepository.findOneBy({
      companyId: data.companyId,
      number: data.number,
    });
    if (existing && existing.id !== id) {
      throw new BadRequestException(
        'An invoice with this number already exists for this company',
      );
    }
    await this.invoiceRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.invoiceRepository.softDelete(id);
  }
}
