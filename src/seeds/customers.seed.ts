import { DataSource, Repository } from 'typeorm';
import { CustomerEntity } from '../customer/customer.entity/customer.entity';

export async function seedCustomers(
  dataSource: DataSource,
  companies: { id: string }[],
) {
  const customerRepo: Repository<CustomerEntity> =
    dataSource.getRepository(CustomerEntity);

  // --- Customers ---
  const customers = [
    customerRepo.create({
      companyId: companies[0].id,
      type: 'customer',
      name: 'Acme Buyer',
      email: 'buyer@acme.com',
    }),
    customerRepo.create({
      companyId: companies[0].id,
      type: 'supplier',
      name: 'Acme Supplier',
      email: 'supplier@acme.com',
    }),
    customerRepo.create({
      companyId: companies[1].id,
      type: 'customer',
      name: 'Globex Client',
      email: 'client@globex.com',
    }),
    customerRepo.create({
      companyId: companies[2].id,
      type: 'customer',
      name: 'Initech Customer',
      email: 'customer@initech.com',
    }),
    customerRepo.create({
      companyId: companies[3].id,
      type: 'supplier',
      name: 'Umbrella Supplier',
      email: 'supplier@umbrella.com',
    }),
  ];
  await customerRepo.save(customers);

  console.log('Seeded customers');
  return customers;
}
