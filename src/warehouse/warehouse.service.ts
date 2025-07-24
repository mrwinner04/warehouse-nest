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

  findAll(companyId: string): Promise<WarehouseEntity[]> {
    return this.warehouseRepository.find({ where: { companyId } });
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
}
