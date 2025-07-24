import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity';
import { OrderItemEntity } from '../orderItem/order-item.entity';
import {
  BestsellingProduct,
  ClientWithMostOrders,
  ProductWithHighestStock,
} from './product.reports';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
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

  async findAll(
    companyId: string,
    page = 1,
    limit = 20,
    filters: { name?: string; code?: string } = {},
  ): Promise<{
    data: ProductEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.companyId = :companyId', { companyId });
    if (filters.name) {
      query.andWhere('product.name ILIKE :name', { name: `%${filters.name}%` });
    }
    if (filters.code) {
      query.andWhere('product.code ILIKE :code', { code: `%${filters.code}%` });
    }
    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit };
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

  async hardRemove(id: string): Promise<void> {
    await this.productRepository.delete(id);
  }

  async getBestsellingProducts(
    companyId: string,
    limit = 10,
  ): Promise<BestsellingProduct[]> {
    return this.orderItemRepository
      .createQueryBuilder('orderItem')
      .innerJoin('orderItem.product', 'product')
      .innerJoin('orderItem.order', 'order')
      .where('order.companyId = :companyId', { companyId })
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('SUM(orderItem.quantity)', 'totalQuantity')
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('"totalQuantity"', 'DESC')
      .limit(limit)
      .getRawMany<BestsellingProduct>();
  }

  async getClientWithMostOrders(
    companyId: string,
  ): Promise<ClientWithMostOrders | undefined> {
    return this.productRepository.manager
      .createQueryBuilder()
      .select('customer.id', 'customerId')
      .addSelect('customer.name', 'customerName')
      .addSelect('COUNT(order.id)', 'orderCount')
      .from('customers', 'customer')
      .innerJoin(
        'orders',
        'order',
        'order.customer_id = customer.id AND order.company_id = :companyId AND order.deleted_at IS NULL',
        { companyId },
      )
      .where('customer.company_id = :companyId', { companyId })
      .andWhere('customer.deleted_at IS NULL')
      .groupBy('customer.id')
      .addGroupBy('customer.name')
      .orderBy('"orderCount"', 'DESC')
      .limit(1)
      .getRawOne<ClientWithMostOrders>();
  }

  async getProductWithHighestStockPerWarehouse(
    companyId: string,
  ): Promise<ProductWithHighestStock[]> {
    return this.productRepository.manager
      .createQueryBuilder()
      .select('warehouse.id', 'warehouseId')
      .addSelect('warehouse.name', 'warehouseName')
      .addSelect('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('SUM(orderItem.quantity)', 'totalStock')
      .from('warehouses', 'warehouse')
      .innerJoin(
        'orders',
        'o',
        'o.warehouse_id = warehouse.id AND o.company_id = :companyId AND o.deleted_at IS NULL',
        { companyId },
      )
      .innerJoin(
        'order_items',
        'orderItem',
        'orderItem.order_id = o.id AND orderItem.deleted_at IS NULL',
      )
      .innerJoin(
        'products',
        'product',
        'product.id = orderItem.product_id AND product.deleted_at IS NULL',
      )
      .where('warehouse.company_id = :companyId', { companyId })
      .andWhere('warehouse.deleted_at IS NULL')
      .groupBy('warehouse.id')
      .addGroupBy('warehouse.name')
      .addGroupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('warehouse.id')
      .addOrderBy('"totalStock"', 'DESC')
      .getRawMany<ProductWithHighestStock>();
  }
}
