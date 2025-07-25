import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
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
import { z } from 'zod';
import { DevModule } from '../dev/dev.module'; // Import DevModule for dev endpoints
@Module({
  imports: [
    (() => {
      // Zod schema for DB config validation
      const DbConfigSchema = z.object({
        type: z.literal('postgres'),
        host: z.string(),
        port: z.number().int().min(1),
        username: z.string(),
        password: z.string(),
        database: z.string(),
        autoLoadEntities: z.boolean(),
        synchronize: z.boolean(),
        namingStrategy: z.any(),
      });
      const dbConfig = {
        type: 'postgres' as const,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'postgres',
        database: process.env.DB_NAME || 'warehouse_nest',
        autoLoadEntities: true,
        synchronize: false,
        namingStrategy: new SnakeNamingStrategy(),
      };
      // Validate config
      const result = DbConfigSchema.safeParse(dbConfig);
      if (!result.success) {
        throw new Error('Invalid DB config: ' + result.error.message);
      }
      return TypeOrmModule.forRoot(dbConfig);
    })(),
    CompanyModule,
    UserModule,
    CustomerModule,
    WarehouseModule,
    ProductModule,
    OrderModule,
    OrderItemModule,
    InvoiceModule,
    AuthModule,
    DevModule, // <-- Remove or comment out in production
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
