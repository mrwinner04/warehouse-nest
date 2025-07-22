import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { CompanyModule } from '../company/company.module';
import { UserModule } from '../user/user.module';
import { CustomerModule } from '../customer/customer.module';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { ProductModule } from '../product/product.module';
import { OrderModule } from '../order/order.module';
import { OrderItemModule } from '../order-item/order-item.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'warehouse_nest',
      autoLoadEntities: true,
      synchronize: false,
      namingStrategy: new SnakeNamingStrategy(),
    }),
    CompanyModule,
    UserModule,
    CustomerModule,
    WarehouseModule,
    ProductModule,
    OrderModule,
    OrderItemModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
