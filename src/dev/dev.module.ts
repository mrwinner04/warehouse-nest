import { Module } from '@nestjs/common';
import { DevController } from './dev.controller';
import { ProductService } from '../product/product.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { CustomerService } from '../customer/customer.service';
import { OrderService } from '../order/order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../product/product.entity';
import { WarehouseEntity } from '../warehouse/warehouse.entity';
import { CustomerEntity } from '../customer/customer.entity';
import { OrderEntity } from '../order/order.entity';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { OrderItemService } from '../orderItem/order-item.service';
import { OrderItemEntity } from '../orderItem/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      WarehouseEntity,
      CustomerEntity,
      OrderEntity,
      OrderItemEntity,
    ]),
    InvoiceModule,
  ],
  controllers: [DevController],
  providers: [
    ProductService,
    WarehouseService,
    CustomerService,
    OrderService,
    OrderItemService,
  ],
})
export class DevModule {}
