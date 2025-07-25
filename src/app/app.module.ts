import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyModule } from '../company/company.module';
import { UserModule } from '../user/user.module';
import { CustomerModule } from '../customer/customer.module';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { ProductModule } from '../product/product.module';
import { OrderModule } from '../order/order.module';
import { OrderItemModule } from '../orderItem/order-item.module';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { AuthModule } from '../auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { DevModule } from '../dev/dev.module';
import { dbConfig } from '../db.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig),
    CompanyModule,
    UserModule,
    CustomerModule,
    WarehouseModule,
    ProductModule,
    OrderModule,
    OrderItemModule,
    InvoiceModule,
    AuthModule,
    DevModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
