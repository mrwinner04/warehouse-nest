import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseEntity } from './warehouse.entity';

//da mahna papkite entiti i da smenq zoda da byde prosto static
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

  findOne(id: string): Promise<WarehouseEntity | null> {
    return this.warehouseRepository.findOneBy({ id });
  }

  async update(
    id: string,
    data: Partial<WarehouseEntity>,
  ): Promise<WarehouseEntity | null> {
    const existing = await this.warehouseRepository.findOneBy({
      companyId: data.companyId,
      name: data.name,
    });
    if (existing && existing.id !== id) {
      throw new BadRequestException(
        'A warehouse with this name already exists for this company',
      );
    }
    await this.warehouseRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.warehouseRepository.softDelete(id);
  }

  async hardRemove(id: string): Promise<void> {
    await this.warehouseRepository.delete(id);
  }
}
