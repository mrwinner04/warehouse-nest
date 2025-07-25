import { Controller, Post, Body } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { CustomerService } from '../customer/customer.service';
import { OrderService } from '../order/order.service';
import { faker } from '@faker-js/faker';
import { nanoid } from 'nanoid';

@Controller('dev')
export class DevController {
  constructor(
    private readonly productService: ProductService,
    private readonly warehouseService: WarehouseService,
    private readonly customerService: CustomerService,
    private readonly orderService: OrderService,
  ) {}

  @Post('generate-demo-data')
  async generateDemoData(@Body() body: { companyId: string }) {
    const { companyId } = body;

    // Generate 5 products
    const products = await Promise.all(
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
    const warehouses = await Promise.all(
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
    const customers = await Promise.all(
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
    const orders = await Promise.all(
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

    return {
      products: products.map((p) => p.id),
      warehouses: warehouses.map((w) => w.id),
      customers: customers.map((c) => c.id),
      orders: orders.map((o) => o.id),
    };
  }
}
