import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CompanyEntity } from '../../company/company.entity/company.entity';
import { CustomerEntity } from '../../customer/customer.entity/customer.entity';
import { WarehouseEntity } from '../../warehouse/warehouse.entity/warehouse.entity';
import { OrderItemEntity } from '../../orderItem/order-item.entity/order-item.entity';
import { InvoiceEntity } from '../../invoice/invoice.entity/invoice.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id', nullable: false })
  companyId: string;

  @ManyToOne(() => CompanyEntity, (company) => company.orders)
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @Column({ type: 'varchar', nullable: false })
  number: string;

  @Column({
    type: 'enum',
    enum: ['sales', 'purchase', 'transfer'],
    name: 'type',
    nullable: false,
  })
  type: 'sales' | 'purchase' | 'transfer';

  @Column({ type: 'uuid', name: 'customer_id', nullable: false })
  customerId: string;

  @ManyToOne(() => CustomerEntity, (customer) => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({ type: 'uuid', name: 'warehouse_id', nullable: false })
  warehouseId: string;

  @ManyToOne(() => WarehouseEntity, (warehouse) => warehouse.orders)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: WarehouseEntity;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  date?: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @Column({ type: 'uuid', name: 'modified_by', nullable: true })
  modifiedBy?: string;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.order)
  orderItems: OrderItemEntity[];

  @OneToMany(() => InvoiceEntity, (invoice) => invoice.order)
  invoices: InvoiceEntity[];
}
