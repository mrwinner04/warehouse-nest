import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemService } from './order-item.service';
import { OrderItemController } from './order-item.controller';
import { OrderItemEntity } from './order-item.entity/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItemEntity])],
  providers: [OrderItemService],
  controllers: [OrderItemController],
})
export class OrderItemModule {}
