import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceEntity } from './invoice.entity';
import { nanoid } from 'nanoid';
import { validateCompanyAccess } from '../common/company-access.utils';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
  ) {}

  async create(data: Partial<InvoiceEntity>): Promise<InvoiceEntity> {
    let number = data.number;
    let tries = 0;
    while (tries < 10) {
      if (!number && data.companyId) {
        number = `INV-${Date.now()}-${nanoid(8)}`;
      }
      const existing = await this.invoiceRepository.findOneBy({
        companyId: data.companyId,
        number,
      });
      if (!existing) break;
      // If duplicate, always generate a new number and retry
      number = `INV-${Date.now()}-${nanoid(8)}`;
      tries++;
    }
    // if (tries === 10) {
    //   throw new Error(
    //     'Could not generate a unique invoice number after 10 tries',
    //   );
    // }
    data.number = number;
    if (!data.date) {
      data.date = new Date();
    }
    const invoice = this.invoiceRepository.create(data);
    return this.invoiceRepository.save(invoice);
  }

  async findAll(
    companyId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: InvoiceEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [data, total] = await this.invoiceRepository.findAndCount({
      where: { companyId },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  // Updated to throw proper errors instead of returning null
  async findOne(id: string, companyId: string): Promise<InvoiceEntity> {
    return validateCompanyAccess(
      () => this.invoiceRepository.findOneBy({ id }),
      companyId,
      'Invoice',
    );
  }

  // Updated to throw proper errors instead of returning null
  async update(
    id: string,
    data: Partial<InvoiceEntity>,
    companyId: string,
  ): Promise<InvoiceEntity> {
    const existing = await this.invoiceRepository.findOneBy({
      companyId,
      number: data.number,
    });
    if (existing && existing.id !== id) {
      throw new BadRequestException(
        'An invoice with this number already exists for this company',
      );
    }

    // First validate access
    await this.findOne(id, companyId);

    // Update the entity
    await this.invoiceRepository.update({ id, companyId }, data);

    // Return the updated entity
    return this.findOne(id, companyId);
  }

  // Updated to throw proper errors
  async remove(id: string, companyId: string): Promise<void> {
    // First validate access
    await this.findOne(id, companyId);

    await this.invoiceRepository.softDelete({ id, companyId });
  }

  // Updated to throw proper errors
  async hardRemove(id: string, companyId: string): Promise<void> {
    // First validate access
    await this.findOne(id, companyId);

    await this.invoiceRepository.delete({ id, companyId });
  }
}
