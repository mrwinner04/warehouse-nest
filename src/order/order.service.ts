import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './order.entity/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async create(data: Partial<OrderEntity>): Promise<OrderEntity> {
    const existing = await this.orderRepository.findOneBy({
      companyId: data.companyId,
      number: data.number,
    });
    if (existing) {
      throw new BadRequestException(
        'An order with this number already exists for this company',
      );
    }
    // If date is not provided, set it to now
    if (!data.date) {
      data.date = new Date();
    }
    const order = this.orderRepository.create(data);
    return this.orderRepository.save(order);
  }

  findAll(): Promise<OrderEntity[]> {
    return this.orderRepository.find();
  }

  findOne(id: string): Promise<OrderEntity | null> {
    return this.orderRepository.findOneBy({ id });
  }

  async update(
    id: string,
    data: Partial<OrderEntity>,
  ): Promise<OrderEntity | null> {
    const existing = await this.orderRepository.findOneBy({
      companyId: data.companyId,
      number: data.number,
    });
    if (existing && existing.id !== id) {
      throw new BadRequestException(
        'An order with this number already exists for this company',
      );
    }
    await this.orderRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.orderRepository.softDelete(id);
  }
}
