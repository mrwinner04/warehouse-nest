import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from './customer.entity/customer.entity';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}

  async create(data: Partial<CustomerEntity>): Promise<CustomerEntity> {
    const existing = await this.customerRepository.findOneBy({
      name: data.name,
      companyId: data.companyId,
    });
    if (existing) {
      throw new BadRequestException(
        'A customer with this name already exists for this company',
      );
    }
    const customer = this.customerRepository.create(data);
    return this.customerRepository.save(customer);
  }

  findAll(): Promise<CustomerEntity[]> {
    return this.customerRepository.find();
  }

  findOne(id: string): Promise<CustomerEntity | null> {
    return this.customerRepository.findOneBy({ id });
  }

  async update(
    id: string,
    data: Partial<CustomerEntity>,
  ): Promise<CustomerEntity | null> {
    const existing = await this.customerRepository.findOneBy({
      name: data.name,
      companyId: data.companyId,
    });
    if (existing && existing.id !== id) {
      throw new BadRequestException(
        'A customer with this name already exists for this company',
      );
    }
    await this.customerRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.customerRepository.softDelete(id);
  }
}
