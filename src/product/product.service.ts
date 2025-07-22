import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity/product.entity';

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

  findAll(): Promise<ProductEntity[]> {
    return this.productRepository.find();
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
}
