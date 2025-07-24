import { DataSource, Repository } from 'typeorm';
import { ProductEntity } from '../product/product.entity';
import { faker } from '@faker-js/faker';

export async function seedProducts(
  dataSource: DataSource,
  companies: { id: string }[],
) {
  const productRepo: Repository<ProductEntity> =
    dataSource.getRepository(ProductEntity);

  // --- Products ---
  const products = companies.flatMap((company) =>
    Array.from({ length: 5 }).map(() =>
      productRepo.create({
        companyId: company.id,
        name: faker.commerce.productName(),
        code: faker.string.alphanumeric(8),
        price: faker.commerce.price({ min: 1, max: 1000, dec: 2 }),
        type: faker.helpers.arrayElement(['solid', 'liquid']),
      }),
    ),
  );
  await productRepo.insert(products);

  console.log('Seeded products');
  return products;
}
