import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseEntity } from './warehouse.entity';
import { validateCompanyAccess } from '../common/company-access.utils';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(WarehouseEntity)
    private readonly warehouseRepository: Repository<WarehouseEntity>,
  ) {}

  async create(data: Partial<WarehouseEntity>): Promise<WarehouseEntity> {
    const existing = await this.warehouseRepository.findOneBy({
      companyId: data.companyId,
      name: data.name,
    });
    if (existing) {
      throw new BadRequestException(
        'A warehouse with this name already exists for this company',
      );
    }
    const warehouse = this.warehouseRepository.create(data);
    return this.warehouseRepository.save(warehouse);
  }

  async findAll(
    companyId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: WarehouseEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [data, total] = await this.warehouseRepository.findAndCount({
      where: { companyId },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  // Updated to throw proper errors instead of returning null
  async findOne(id: string, companyId: string): Promise<WarehouseEntity> {
    return validateCompanyAccess(
      () => this.warehouseRepository.findOneBy({ id }),
      companyId,
      'Warehouse',
    );
  }

  // Updated to throw proper errors instead of returning null
  async update(
    id: string,
    data: Partial<WarehouseEntity>,
    companyId: string,
  ): Promise<WarehouseEntity> {
    const existing = await this.warehouseRepository.findOneBy({
      companyId,
      name: data.name,
    });
    if (existing && existing.id !== id) {
      throw new BadRequestException(
        'A warehouse with this name already exists for this company',
      );
    }

    // First validate access
    await this.findOne(id, companyId);

    // Update the entity
    await this.warehouseRepository.update({ id, companyId }, data);

    // Return the updated entity
    return this.findOne(id, companyId);
  }

  // Updated to throw proper errors
  async remove(id: string, companyId: string): Promise<void> {
    // First validate access
    await this.findOne(id, companyId);

    await this.warehouseRepository.softDelete({ id, companyId });
  }

  // Updated to throw proper errors
  async hardRemove(id: string, companyId: string): Promise<void> {
    // First validate access
    await this.findOne(id, companyId);

    await this.warehouseRepository.delete({ id, companyId });
  }
}
