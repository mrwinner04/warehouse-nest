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

    await this.findOne(id, companyId);

    await this.orderItemRepository.update(id, data);

    return this.findOne(id, companyId);
  }

  async remove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);

    await this.orderItemRepository.softDelete(id);
  }

  async hardRemove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);

    await this.orderItemRepository.delete(id);
  }
}
