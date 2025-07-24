import { DataSource, Repository } from 'typeorm';
import { OrderItemEntity } from '../orderItem/order-item.entity';
import { faker } from '@faker-js/faker';

interface OrderLike {
  id: string;
  companyId: string;
}
interface ProductLike {
  id: string;
  companyId: string;
  price: string;
}

export async function seedOrderItems(
  dataSource: DataSource,
  orders: OrderLike[],
  products: ProductLike[],
) {
  const orderItemRepo: Repository<OrderItemEntity> =
    dataSource.getRepository(OrderItemEntity);

  // --- Order Items ---
  const orderItems = orders.flatMap((order) => {
    const availableProducts = faker.helpers.shuffle(
      products.filter((p) => p.companyId === order.companyId),
    );
    return availableProducts.slice(0, 3).map((product) =>
      orderItemRepo.create({
        orderId: order.id,
        productId: product.id,
        quantity: faker.number.int({ min: 1, max: 10 }),
        price: product.price,
      }),
    );
  });
  await orderItemRepo.insert(orderItems);

  console.log('Seeded order items');
  return orderItems;
}
