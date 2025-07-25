import { DataSource, Repository } from 'typeorm';
import { CustomerEntity } from '../customer/customer.entity';
import { faker } from '@faker-js/faker';

export async function seedCustomers(
  dataSource: DataSource,
  companies: { id: string }[],
) {
  const customerRepo: Repository<CustomerEntity> =
    dataSource.getRepository(CustomerEntity);

  // --- Customers ---
  const customers = companies.flatMap((company) =>
    Array.from({ length: 3 }).map(() =>
      customerRepo.create({
        companyId: company.id,
        type: faker.helpers.arrayElement(['customer', 'supplier']),
        name: faker.company.name(),
        email: faker.internet.email(),
      }),
    ),
  );
  await customerRepo.insert(customers);

  return customers;
}
