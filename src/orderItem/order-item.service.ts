import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
  ) {}

  async create(data: Partial<OrderItemEntity>): Promise<OrderItemEntity> {
    const existing = await this.orderItemRepository.findOneBy({
      orderId: data.orderId,
      productId: data.productId,
    });
    if (existing) {
      throw new BadRequestException(
        'This product is already added to the order',
      );
    }
    const orderItem = this.orderItemRepository.create(data);
    return this.orderItemRepository.save(orderItem);
  }

  async findAll(companyId: string): Promise<OrderItemEntity[]> {
    return this.orderItemRepository
      .createQueryBuilder('orderItem')
      .innerJoin('orderItem.order', 'order')
      .where('order.companyId = :companyId', { companyId })
      .getMany();
  }

  findOne(id: string): Promise<OrderItemEntity | null> {
    return this.orderItemRepository.findOneBy({ id });
  }

  async update(
    id: string,
    data: Partial<OrderItemEntity>,
  ): Promise<OrderItemEntity | null> {
    const existing = await this.orderItemRepository.findOneBy({
      orderId: data.orderId,
      productId: data.productId,
    });
    if (existing && existing.id !== id) {
      throw new BadRequestException(
        'This product is already added to the order',
      );
    }
    await this.orderItemRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.orderItemRepository.softDelete(id);
  }
}
