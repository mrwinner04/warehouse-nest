import { DataSource, Repository } from 'typeorm';
import { OrderItemEntity } from '../orderItem/order-item.entity/order-item.entity';

export async function seedOrderItems(
  dataSource: DataSource,
  orders: { id: string }[],
  products: { id: string }[],
) {
  const orderItemRepo: Repository<OrderItemEntity> =
    dataSource.getRepository(OrderItemEntity);

  // --- Order Items ---
  const orderItems = [
    orderItemRepo.create({
      orderId: orders[0].id,
      productId: products[0].id,
      quantity: 2,
      price: '9.99',
    }),
    orderItemRepo.create({
      orderId: orders[0].id,
      productId: products[1].id,
      quantity: 1,
      price: '19.99',
    }),
    orderItemRepo.create({
      orderId: orders[1].id,
      productId: products[2].id,
      quantity: 3,
      price: '29.99',
    }),
    orderItemRepo.create({
      orderId: orders[2].id,
      productId: products[3].id,
      quantity: 5,
      price: '0.99',
    }),
    orderItemRepo.create({
      orderId: orders[3].id,
      productId: products[4].id,
      quantity: 1,
      price: '999.99',
    }),
  ];
  await orderItemRepo.save(orderItems);

  console.log('Seeded order items');
  return orderItems;
}
