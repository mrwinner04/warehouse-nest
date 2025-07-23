import { DataSource, Repository } from 'typeorm';
import { CompanyEntity } from '../company/company.entity/company.entity';
import { WarehouseEntity } from '../warehouse/warehouse.entity/warehouse.entity';

export async function seedCompaniesAndWarehouses(dataSource: DataSource) {
  const companyRepo: Repository<CompanyEntity> =
    dataSource.getRepository(CompanyEntity);
  const warehouseRepo: Repository<WarehouseEntity> =
    dataSource.getRepository(WarehouseEntity);

  // --- Companies ---
  const companies = [
    companyRepo.create({ name: 'Acme Corp' }),
    companyRepo.create({ name: 'Globex Inc.' }),
    companyRepo.create({ name: 'Initech' }),
    companyRepo.create({ name: 'Umbrella Corp' }),
  ];
  await companyRepo.save(companies);

  // --- Warehouses ---
  const warehouses = [
    warehouseRepo.create({
      companyId: companies[0].id,
      name: 'Acme Main Warehouse',
      address: '123 Acme St',
      type: 'solid',
    }),
    warehouseRepo.create({
      companyId: companies[0].id,
      name: 'Acme Liquid Storage',
      address: '456 Acme Ave',
      type: 'liquid',
    }),
    warehouseRepo.create({
      companyId: companies[1].id,
      name: 'Globex Central',
      address: '789 Globex Blvd',
      type: 'solid',
    }),
    warehouseRepo.create({
      companyId: companies[2].id,
      name: 'Initech Warehouse',
      address: '101 Initech Rd',
      type: 'solid',
    }),
    warehouseRepo.create({
      companyId: companies[3].id,
      name: 'Umbrella Storage',
      address: '202 Umbrella Ln',
      type: 'liquid',
    }),
  ];
  await warehouseRepo.save(warehouses);

  console.log('Seeded companies and warehouses');
  return { companies, warehouses };
}
