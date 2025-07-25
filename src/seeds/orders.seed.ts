import { DataSource, Repository } from 'typeorm';
import { OrderEntity } from '../order/order.entity';
import { faker } from '@faker-js/faker';

interface CompanyLike {
  id: string;
}
interface CustomerLike {
  id: string;
  companyId: string;
}
interface WarehouseLike {
  id: string;
  companyId: string;
}

export async function seedOrders(
  dataSource: DataSource,
  companies: CompanyLike[],
  customers: CustomerLike[],
  warehouses: WarehouseLike[],
) {
  const orderRepo: Repository<OrderEntity> =
    dataSource.getRepository(OrderEntity);

  // --- Orders ---
  const orders = companies.flatMap((company) =>
    Array.from({ length: 4 }).map(() => {
      const customer = faker.helpers.arrayElement(
        customers.filter((c) => c.companyId === company.id),
      );
      const warehouse = faker.helpers.arrayElement(
        warehouses.filter((w) => w.companyId === company.id),
      );
      return orderRepo.create({
        companyId: company.id,
        number: faker.string.alphanumeric(10).toUpperCase(),
        type: faker.helpers.arrayElement(['sales', 'purchase', 'transfer']),
        customerId: customer.id,
        warehouseId: warehouse.id,
        date: faker.date.recent(),
      });
    }),
  );
  await orderRepo.insert(orders);

  return orders;
}
