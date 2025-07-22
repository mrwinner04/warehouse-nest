import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateCustomers1753106306314 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "customer_type_enum" AS ENUM ('customer', 'supplier')`,
    );

    await queryRunner.createTable(
      new Table({
        name: 'customers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isNullable: false,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'customer_type_enum',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'modified_by',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'customers',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedTableName: 'companies',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'customers',
      new TableForeignKey({
        columnNames: ['modified_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createIndex(
      'customers',
      new TableIndex({
        name: 'IDX_CUSTOMERS_COMPANY_ID',
        columnNames: ['company_id'],
      }),
    );
    await queryRunner.createIndex(
      'customers',
      new TableIndex({
        name: 'IDX_CUSTOMERS_TYPE',
        columnNames: ['type'],
      }),
    );
    await queryRunner.createIndex(
      'customers',
      new TableIndex({
        name: 'IDX_CUSTOMERS_EMAIL',
        columnNames: ['email'],
      }),
    );
    await queryRunner.createIndex(
      'customers',
      new TableIndex({
        name: 'IDX_CUSTOMERS_DELETED_AT',
        columnNames: ['deleted_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('customers');
    await queryRunner.query('DROP TYPE IF EXISTS "customer_type_enum"');
  }
}
