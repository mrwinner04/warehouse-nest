import { Controller, Post, Body } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { CustomerService } from '../customer/customer.service';
import { OrderService } from '../order/order.service';
import { OrderItemService } from '../orderItem/order-item.service';
import { ProductEntity } from '../product/product.entity';
import { WarehouseEntity } from '../warehouse/warehouse.entity';
import { CustomerEntity } from '../customer/customer.entity';
import { OrderEntity } from '../order/order.entity';
import { OrderItemEntity } from '../orderItem/order-item.entity';
import { faker } from '@faker-js/faker';
import { nanoid } from 'nanoid';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GenerateDemoDataDto, DemoDataResponseDto } from './dto/dev.dto';

@ApiTags('Development')
@ApiBearerAuth('access-token')
@Controller('dev')
export class DevController {
  constructor(
    private readonly productService: ProductService,
    private readonly warehouseService: WarehouseService,
    private readonly customerService: CustomerService,
    private readonly orderService: OrderService,
    private readonly orderItemService: OrderItemService,
  ) {}

  @Post('generate-demo-data')
  @ApiOperation({ summary: 'Generate demo data for testing' })
  @ApiResponse({
    status: 201,
    description: 'Demo data generated successfully',
    type: DemoDataResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid company ID' })
  async generateDemoData(
    @Body() body: GenerateDemoDataDto,
  ): Promise<DemoDataResponseDto> {
    const { companyId } = body;

    // Generate 5 products
    const products: ProductEntity[] = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        this.productService.create({
          companyId,
          name: faker.commerce.productName(),
          code: faker.string.alphanumeric(8),
          price: faker.commerce.price({ min: 1, max: 1000, dec: 2 }),
          type: faker.helpers.arrayElement(['solid', 'liquid']),
        }),
      ),
    );

    // Generate 5 warehouses
    const warehouses: WarehouseEntity[] = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        this.warehouseService.create({
          companyId,
          name: faker.company.name() + ' Warehouse',
          address: faker.location.streetAddress(),
          type: faker.helpers.arrayElement(['solid', 'liquid']),
        }),
      ),
    );

    // Generate 5 customers
    const customers: CustomerEntity[] = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        this.customerService.create({
          companyId,
          type: faker.helpers.arrayElement(['customer', 'supplier']),
          name: faker.company.name(),
          email: faker.internet.email(),
        }),
      ),
    );

    // Generate 5 orders with unique order numbers
    const orders: OrderEntity[] = await Promise.all(
      Array.from({ length: 5 }).map((_, index) =>
        this.orderService.create({
          companyId,
          number: `ORD-${Date.now()}-${index}-${nanoid(8)}`, // Ensure unique order numbers
          type: faker.helpers.arrayElement(['sales', 'purchase', 'transfer']),
          customerId: faker.helpers.arrayElement(customers).id,
          warehouseId: faker.helpers.arrayElement(warehouses).id,
          date: faker.date.recent(),
        }),
      ),
    );

    // Generate order items for each order
    const orderItems: OrderItemEntity[] = [];
    for (const order of orders) {
      const numItems = faker.number.int({ min: 1, max: 3 });
      const usedProductIds = new Set<string>();
      for (let i = 0; i < numItems; i++) {
        let product: ProductEntity;
        do {
          product = faker.helpers.arrayElement(products);
        } while (
          usedProductIds.has(product.id) &&
          usedProductIds.size < products.length
        );
        usedProductIds.add(product.id);
        const quantity = faker.number.int({ min: 1, max: 10 });
        orderItems.push(
          await this.orderItemService.create({
            orderId: order.id,
            productId: product.id,
            quantity,
            price: product.price,
          }),
        );
      }
    }

    return {
      products: products.map((p) => p.id),
      warehouses: warehouses.map((w) => w.id),
      customers: customers.map((c) => c.id),
      orders: orders.map((o) => o.id),
      orderItems: orderItems.map((oi) => oi.id),
    };
  }
}
