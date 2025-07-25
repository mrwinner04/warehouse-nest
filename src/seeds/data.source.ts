import { DataSource } from 'typeorm';
import { dbConfig } from '../db.config';
import { CompanyEntity } from '../company/company.entity';
import { UserEntity } from '../user/user.entity';
import { WarehouseEntity } from '../warehouse/warehouse.entity';
import { ProductEntity } from '../product/product.entity';
import { CustomerEntity } from '../customer/customer.entity';
import { OrderItemEntity } from '../orderItem/order-item.entity';
import { OrderEntity } from '../order/order.entity';
import { InvoiceEntity } from '../invoice/invoice.entity';

export const AppDataSource = new DataSource({
  ...dbConfig,
  entities: [
    CompanyEntity,
    UserEntity,
    WarehouseEntity,
    ProductEntity,
    CustomerEntity,
    OrderItemEntity,
    OrderEntity,
    InvoiceEntity,
  ],
});
