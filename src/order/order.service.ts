import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OrderEntity } from './order.entity';
import { OrderItemEntity } from '../orderItem/order-item.entity';
import { InvoiceEntity } from '../invoice/invoice.entity';
import { InvoiceService } from '../invoice/invoice.service';
import { validateCompanyAccess } from '../common/company-access.utils';
import { CreateOrderWithItemsDto, OrderResponseDto } from './dto/order.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @Inject(forwardRef(() => InvoiceService))
    private readonly invoiceService: InvoiceService,
    private readonly dataSource: DataSource,
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

  async createWithItems(
    data: CreateOrderWithItemsDto,
    companyId: string,
    userId?: string,
  ): Promise<OrderResponseDto> {
    if (!data.orderItems || data.orderItems.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    if (!data.number) {
      data.number = `ORD-${Date.now()}-${nanoid(8)}`;
    }

    const existingOrder = await this.orderRepository.findOneBy({
      companyId,
      number: data.number,
    });
    if (existingOrder) {
      throw new BadRequestException(
        'An order with this number already exists for this company',
      );
    }

    const orderDate = data.date || new Date();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orderData: Partial<OrderEntity> = {
        number: data.number,
        type: data.type as 'sales' | 'purchase' | 'transfer',
        customerId: data.customerId,
        warehouseId: data.warehouseId,
        date: orderDate,
        companyId,
        modifiedBy: userId,
      };

      const order = this.orderRepository.create(orderData);
      const savedOrder = await queryRunner.manager.save(OrderEntity, order);

      const orderItems = data.orderItems.map((item) =>
        this.orderItemRepository.create({
          orderId: savedOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          modifiedBy: userId,
        }),
      );

      const savedOrderItems = await queryRunner.manager.save(
        OrderItemEntity,
        orderItems,
      );

      console.log('✅ Order and order items created successfully');
      console.log('📦 Order ID:', savedOrder.id);
      console.log('📦 Order Items Count:', savedOrderItems.length);

      // Create invoice directly in the transaction
      const invoiceData = {
        companyId: savedOrder.companyId,
        orderId: savedOrder.id,
        number: `INV-${Date.now()}-${nanoid(8)}`,
        date: savedOrder.date,
        status: 'pending',
        modifiedBy: userId,
      };

      console.log('🧾 Creating invoice with data:', invoiceData);

      const savedInvoice = await queryRunner.manager.save(
        InvoiceEntity,
        invoiceData,
      );
      console.log('✅ Invoice created successfully:', savedInvoice.id);

      await queryRunner.commitTransaction();
      console.log('✅ Transaction committed successfully');

      return {
        id: savedOrder.id,
        number: savedOrder.number,
        type: savedOrder.type,
        customerId: savedOrder.customerId,
        warehouseId: savedOrder.warehouseId,
        date: savedOrder.date!,
        createdAt: savedOrder.createdAt,
        updatedAt: savedOrder.updatedAt,
        orderItems: savedOrderItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          createdAt: item.createdAt,
        })),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
