import { AppDataSource } from './data.source';
import { seedCompaniesAndWarehouses } from './companies.seed';
import { seedUsers } from './users.seed';
import { seedProducts } from './products.seed';
import { seedCustomers } from './customers.seed';
import { seedOrders } from './orders.seed';
import { seedOrderItems } from './order-items.seed';

//kato nova migraciq da se napravi .insert
async function runAllSeeds() {
  await AppDataSource.initialize();

  const { companies, warehouses } =
    await seedCompaniesAndWarehouses(AppDataSource);

  await seedUsers(AppDataSource, companies);

  const products = await seedProducts(AppDataSource, companies);

  const customers = await seedCustomers(AppDataSource, companies);

  const orders = await seedOrders(
    AppDataSource,
    companies,
    customers,
    warehouses,
  );

  await seedOrderItems(AppDataSource, orders, products);

  await AppDataSource.destroy();
  console.log('All seeds completed!');
}

runAllSeeds().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
