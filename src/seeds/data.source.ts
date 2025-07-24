import { DataSource } from 'typeorm';
import { CompanyEntity } from '../company/company.entity';
import { UserEntity } from '../user/user.entity';
import { WarehouseEntity } from '../warehouse/warehouse.entity';
import { ProductEntity } from '../product/product.entity';
import { CustomerEntity } from '../customer/customer.entity/customer.entity';
import { OrderItemEntity } from '../orderItem/order-item.entity';
import { OrderEntity } from '../order/order.entity';
import { InvoiceEntity } from '../invoice/invoice.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'warehouse_nest',
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
