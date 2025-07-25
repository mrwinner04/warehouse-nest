import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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

  // Custom validation for order items since they don't have direct companyId
  async findOne(id: string, companyId: string): Promise<OrderItemEntity> {
    const orderItem = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .innerJoin('orderItem.order', 'order')
      .where('orderItem.id = :id', { id })
      .andWhere('order.companyId = :companyId', { companyId })
      .getOne();

    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }

    return orderItem;
  }

  // Updated to throw proper errors instead of returning null
  async update(
    id: string,
    data: Partial<OrderItemEntity>,
    companyId: string,
  ): Promise<OrderItemEntity> {
    const existing = await this.orderItemRepository.findOneBy({
      orderId: data.orderId,
      productId: data.productId,
    });
    if (existing && existing.id !== id) {
      throw new BadRequestException(
        'This product is already added to the order',
      );
    }

    // First validate access
    await this.findOne(id, companyId);

    // Update the entity
    await this.orderItemRepository.update(id, data);

    // Return the updated entity
    return this.findOne(id, companyId);
  }

  // Updated to throw proper errors
  async remove(id: string, companyId: string): Promise<void> {
    // First validate access
    await this.findOne(id, companyId);

    await this.orderItemRepository.softDelete(id);
  }

  // Updated to throw proper errors
  async hardRemove(id: string, companyId: string): Promise<void> {
    // First validate access
    await this.findOne(id, companyId);

    await this.orderItemRepository.delete(id);
  }
}
