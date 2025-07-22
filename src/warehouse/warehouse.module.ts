import { Module } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';

@Module({
  providers: [WarehouseService],
  controllers: [WarehouseController],
})
export class WarehouseModule {}
