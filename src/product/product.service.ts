import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity';
import { assertNotExists } from '../common.utils';
import { validateCompanyAccess } from '../common/company-access.utils';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async create(data: Partial<ProductEntity>): Promise<ProductEntity> {
    if (data.code) {
      await assertNotExists(
        this.productRepository,
        { companyId: data.companyId, code: data.code },
        'A product with this code already exists for this company',
      );
    }
    const product = this.productRepository.create(data);
    return this.productRepository.save(product);
  }

  async findAll(
    companyId: string,
    page = 1,
    limit = 20,
    filters: { name?: string; code?: string } = {},
  ): Promise<{
    data: ProductEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.companyId = :companyId', { companyId });
    if (filters.name) {
      query.andWhere('product.name ILIKE :name', { name: `%${filters.name}%` });
    }
    if (filters.code) {
      query.andWhere('product.code ILIKE :code', { code: `%${filters.code}%` });
    }
    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit };
  }

  // Updated to throw proper errors instead of returning null
  async findOne(id: string, companyId: string): Promise<ProductEntity> {
    return validateCompanyAccess(
      () => this.productRepository.findOneBy({ id }),
      companyId,
      'Product',
    );
  }

  // Updated to throw proper errors instead of returning null
  async update(
    id: string,
    data: Partial<ProductEntity>,
    companyId: string,
  ): Promise<ProductEntity> {
    if (data.code) {
      await assertNotExists(
        this.productRepository,
        { companyId, code: data.code },
        'A product with this code already exists for this company',
        id,
      );
    }

    // First validate access
    await this.findOne(id, companyId);

    // Update the entity
    await this.productRepository.update({ id, companyId }, data);

    // Return the updated entity
    return this.findOne(id, companyId);
  }

  // Updated to throw proper errors
  async remove(id: string, companyId: string): Promise<void> {
    // First validate access
    await this.findOne(id, companyId);

    await this.productRepository.softDelete({ id, companyId });
  }

  // Updated to throw proper errors
  async hardRemove(id: string, companyId: string): Promise<void> {
    // First validate access
    await this.findOne(id, companyId);

    await this.productRepository.delete({ id, companyId });
  }
}
