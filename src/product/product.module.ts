import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductEntity } from './product.entity';
import { OrderItemEntity } from 'src/orderItem/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, OrderItemEntity])],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
