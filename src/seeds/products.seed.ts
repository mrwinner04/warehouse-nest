import { DataSource, Repository } from 'typeorm';
import { ProductEntity } from '../product/product.entity/product.entity';

export async function seedProducts(
  dataSource: DataSource,
  companies: { id: string }[],
) {
  const productRepo: Repository<ProductEntity> =
    dataSource.getRepository(ProductEntity);

  // --- Products ---
  const products = [
    productRepo.create({
      companyId: companies[0].id,
      name: 'Widget',
      code: 'WGT-001',
      price: '9.99',
      type: 'solid',
    }),
    productRepo.create({
      companyId: companies[0].id,
      name: 'Gadget',
      code: 'GDT-002',
      price: '19.99',
      type: 'solid',
    }),
    productRepo.create({
      companyId: companies[1].id,
      name: 'Globex Elixir',
      code: 'ELX-100',
      price: '29.99',
      type: 'liquid',
    }),
    productRepo.create({
      companyId: companies[2].id,
      name: 'TPS Report',
      code: 'TPS-777',
      price: '0.99',
      type: 'solid',
    }),
    productRepo.create({
      companyId: companies[3].id,
      name: 'T-Virus',
      code: 'TVR-666',
      price: '999.99',
      type: 'liquid',
    }),
  ];
  await productRepo.save(products);

  console.log('Seeded products');
  return products;
}
