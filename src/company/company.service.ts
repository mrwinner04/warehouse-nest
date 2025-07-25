import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyEntity } from './company.entity';
import { assertNotExists } from '../common.utils';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
  ) {}

  async create(data: Partial<CompanyEntity>): Promise<CompanyEntity> {
    await assertNotExists(
      this.companyRepository,
      { name: data.name },
      'A company with this name already exists',
    );
    const company = this.companyRepository.create(data);
    return this.companyRepository.save(company);
  }

  async findAll(): Promise<CompanyEntity[]> {
    return this.companyRepository.find();
  }

  async findOne(id: string): Promise<CompanyEntity | null> {
    return this.companyRepository.findOneBy({ id });
  }

  async update(
    id: string,
    data: Partial<CompanyEntity>,
  ): Promise<CompanyEntity | null> {
    await assertNotExists(
      this.companyRepository,
      { name: data.name },
      'A company with this name already exists',
      id,
    );
    await this.companyRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.companyRepository.softDelete(id);
  }
}
