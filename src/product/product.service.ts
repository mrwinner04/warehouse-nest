import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async create(data: Partial<ProductEntity>): Promise<ProductEntity> {
    if (data.code) {
      const existing = await this.productRepository.findOneBy({
        companyId: data.companyId,
        code: data.code,
      });
      if (existing) {
        throw new BadRequestException(
          'A product with this code already exists for this company',
        );
      }
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

  findOne(id: string): Promise<ProductEntity | null> {
    return this.productRepository.findOneBy({ id });
  }

  async update(
    id: string,
    data: Partial<ProductEntity>,
  ): Promise<ProductEntity | null> {
    if (data.code) {
      const existing = await this.productRepository.findOneBy({
        companyId: data.companyId,
        code: data.code,
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(
          'A product with this code already exists for this company',
        );
      }
    }
    await this.productRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.productRepository.softDelete(id);
  }

  async hardRemove(id: string): Promise<void> {
    await this.productRepository.delete(id);
  }
}
