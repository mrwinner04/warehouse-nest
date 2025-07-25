import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './order.entity';
import { InvoiceService } from '../invoice/invoice.service';
import { validateCompanyAccess } from '../common/company-access.utils';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @Inject(forwardRef(() => InvoiceService))
    private readonly invoiceService: InvoiceService,
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
    if (!data.date) {
      data.date = new Date();
    }
    const order = this.orderRepository.create(data);
    const savedOrder = await this.orderRepository.save(order);

    await this.invoiceService.create({
      companyId: savedOrder.companyId,
      orderId: savedOrder.id,
      date: savedOrder.date,
      status: 'pending',
    });

    return savedOrder;
  }

  async findAll(
    companyId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: OrderEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [data, total] = await this.orderRepository.findAndCount({
      where: { companyId },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: string, companyId: string): Promise<OrderEntity> {
    return validateCompanyAccess(
      () => this.orderRepository.findOneBy({ id }),
      companyId,
      'Order',
    );
  }

  async update(
    id: string,
    data: Partial<OrderEntity>,
    companyId: string,
  ): Promise<OrderEntity> {
    const existing = await this.orderRepository.findOneBy({
      companyId,
      number: data.number,
    });
    if (existing && existing.id !== id) {
      throw new BadRequestException(
        'An order with this number already exists for this company',
      );
    }

    await this.findOne(id, companyId);

    await this.orderRepository.update({ id, companyId }, data);

    return this.findOne(id, companyId);
  }

  async remove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);

    await this.orderRepository.softDelete({ id, companyId });
  }

  async hardRemove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);

    await this.orderRepository.delete({ id, companyId });
  }
}
