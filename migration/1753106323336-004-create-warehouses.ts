import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateWarehouses1753106323336 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'warehouses',
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
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'address',
            type: 'text',
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
      'warehouses',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedTableName: 'companies',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'warehouses',
      new TableForeignKey({
        columnNames: ['modified_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createIndex(
      'warehouses',
      new TableIndex({
        name: 'IDX_WAREHOUSES_COMPANY_ID',
        columnNames: ['company_id'],
      }),
    );
    await queryRunner.createIndex(
      'warehouses',
      new TableIndex({
        name: 'IDX_WAREHOUSES_NAME',
        columnNames: ['name'],
      }),
    );
    await queryRunner.createIndex(
      'warehouses',
      new TableIndex({
        name: 'IDX_WAREHOUSES_DELETED_AT',
        columnNames: ['deleted_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('warehouses');
  }
}
