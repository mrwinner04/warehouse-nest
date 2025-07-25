import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from './customer.entity';
import { assertNotExists } from '../common/common.utils';
import { validateCompanyAccess } from '../common/company-access.utils';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}

  async create(data: Partial<CustomerEntity>): Promise<CustomerEntity> {
    await assertNotExists(
      this.customerRepository,
      { name: data.name, companyId: data.companyId },
      'A customer with this name already exists for this company',
    );
    const customer = this.customerRepository.create(data);
    return this.customerRepository.save(customer);
  }

  async findAll(
    companyId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: CustomerEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [data, total] = await this.customerRepository.findAndCount({
      where: { companyId },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: string, companyId: string): Promise<CustomerEntity> {
    return validateCompanyAccess(
      () => this.customerRepository.findOneBy({ id }),
      companyId,
      'Customer',
    );
  }

  async update(
    id: string,
    data: Partial<CustomerEntity>,
    companyId: string,
  ): Promise<CustomerEntity> {
    await assertNotExists(
      this.customerRepository,
      { name: data.name, companyId },
      'A customer with this name already exists for this company',
      id,
    );

    await this.findOne(id, companyId);

    await this.customerRepository.update({ id, companyId }, data);

    return this.findOne(id, companyId);
  }

  async remove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);

    await this.customerRepository.softDelete({ id, companyId });
  }

  async hardRemove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);

    await this.customerRepository.delete({ id, companyId });
  }
}
