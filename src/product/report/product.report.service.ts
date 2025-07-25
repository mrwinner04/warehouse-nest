import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '..//product.entity';
import { OrderItemEntity } from '../../orderItem/order-item.entity';
import {
  BestsellingProduct,
  ClientWithMostOrders,
  ProductWithHighestStock,
} from './product.reports';

@Injectable()
export class ProductReportService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
  ) {}

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
