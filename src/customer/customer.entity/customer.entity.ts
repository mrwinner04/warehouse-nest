import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderEntity } from '../../order/order.entity';
import { CompanyEntity } from '../../company/company.entity';

@Entity('customers')
export class CustomerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id', nullable: false })
  companyId: string;

  @ManyToOne(() => CompanyEntity, (company) => company.customers)
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @Column({
    type: 'enum',
    enum: ['customer', 'supplier'],
    name: 'type',
    nullable: false,
  })
  type: 'customer' | 'supplier';

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  email?: string;

  @OneToMany(() => OrderEntity, (order) => order.customer)
  orders: OrderEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @Column({ type: 'uuid', name: 'modified_by', nullable: true })
  modifiedBy?: string;
}
