import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderEntity } from '../../order/order.entity/order.entity';
import { CustomerEntity } from '../../customer/customer.entity/customer.entity';
import { UserEntity } from '../../user/user.entity/user.entity';
import { ProductEntity } from '../../product/product.entity/product.entity';
import { InvoiceEntity } from '../../invoice/invoice.entity/invoice.entity';
// Add similar imports for WarehouseEntity as needed

@Entity('companies')
export class CompanyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @Column({ type: 'uuid', name: 'modified_by', nullable: true })
  modifiedBy?: string;

  @OneToMany(() => OrderEntity, (order) => order.company)
  orders: OrderEntity[];

  @OneToMany(() => CustomerEntity, (customer) => customer.company)
  customers: CustomerEntity[];

  @OneToMany(() => UserEntity, (user) => user.company)
  users: UserEntity[];

  @OneToMany(() => ProductEntity, (product) => product.company)
  products: ProductEntity[];

  @OneToMany(() => InvoiceEntity, (invoice) => invoice.company)
  invoices: InvoiceEntity[];
  // Add similar OneToMany for warehouses, invoices
}
