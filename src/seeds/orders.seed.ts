import { DataSource, Repository } from 'typeorm';
import { OrderEntity } from '../order/order.entity/order.entity';

export async function seedOrders(
  dataSource: DataSource,
  companies: { id: string }[],
  customers: { id: string }[],
  warehouses: { id: string }[],
) {
  const orderRepo: Repository<OrderEntity> =
    dataSource.getRepository(OrderEntity);

  // --- Orders ---
  const orders = [
    orderRepo.create({
      companyId: companies[0].id,
      number: 'ORD-ACME-001',
      type: 'sales',
      customerId: customers[0].id,
      warehouseId: warehouses[0].id,
      date: new Date(),
    }),
    orderRepo.create({
      companyId: companies[1].id,
      number: 'ORD-GLOBEX-001',
      type: 'purchase',
      customerId: customers[2].id,
      warehouseId: warehouses[2].id,
      date: new Date(),
    }),
    orderRepo.create({
      companyId: companies[2].id,
      number: 'ORD-INITECH-001',
      type: 'sales',
      customerId: customers[3].id,
      warehouseId: warehouses[3].id,
      date: new Date(),
    }),
    orderRepo.create({
      companyId: companies[3].id,
      number: 'ORD-UMBRELLA-001',
      type: 'transfer',
      customerId: customers[4].id,
      warehouseId: warehouses[4].id,
      date: new Date(),
    }),
  ];
  await orderRepo.save(orders);

  console.log('Seeded orders');
  return orders;
}
