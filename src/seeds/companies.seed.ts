import { DataSource, Repository } from 'typeorm';
import { CompanyEntity } from '../company/company.entity/company.entity';
import { WarehouseEntity } from '../warehouse/warehouse.entity/warehouse.entity';
import { faker } from '@faker-js/faker';

export async function seedCompaniesAndWarehouses(dataSource: DataSource) {
  const companyRepo: Repository<CompanyEntity> =
    dataSource.getRepository(CompanyEntity);
  const warehouseRepo: Repository<WarehouseEntity> =
    dataSource.getRepository(WarehouseEntity);

  // --- Companies ---
  const companies = Array.from({ length: 4 }).map(() =>
    companyRepo.create({ name: faker.company.name() }),
  );
  await companyRepo.save(companies);

  // --- Warehouses ---
  const warehouses = [
    warehouseRepo.create({
      companyId: companies[0].id,
      name: faker.company.name() + ' Main Warehouse',
      address: faker.location.streetAddress(),
      type: 'solid',
    }),
    warehouseRepo.create({
      companyId: companies[0].id,
      name: faker.company.name() + ' Liquid Storage',
      address: faker.location.streetAddress(),
      type: 'liquid',
    }),
    warehouseRepo.create({
      companyId: companies[1].id,
      name: faker.company.name() + ' Central',
      address: faker.location.streetAddress(),
      type: 'solid',
    }),
    warehouseRepo.create({
      companyId: companies[2].id,
      name: faker.company.name() + ' Warehouse',
      address: faker.location.streetAddress(),
      type: 'solid',
    }),
    warehouseRepo.create({
      companyId: companies[3].id,
      name: faker.company.name() + ' Storage',
      address: faker.location.streetAddress(),
      type: 'liquid',
    }),
  ];
  await warehouseRepo.save(warehouses);

  console.log('Seeded companies and warehouses');
  return { companies, warehouses };
}
