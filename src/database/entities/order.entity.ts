import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Cart } from './cart.entity';

export enum OrderStatus {
  OPEN = 'OPEN',
  APPROVED = 'APPROVED',
  CONFIRMED = 'CONFIRMED',
  SENT = 'SENT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  ONLINE = 'ONLINE',
  CARD = 'CARD',
  CASH = 'CASH',
}

export enum DeliveryCompany {
  DPD = 'DPD',
  DHL = 'DHL',
  UPS = 'UPS',
  POCZTA_POLSKA = 'POCZTA_POLSKA',
}

export type address = { firstName: string; lastName: string; address: string };

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, {
    eager: true,
  })
  user: User;

  @OneToOne(() => Cart, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  cart: Cart;

  @Column({ type: 'jsonb', nullable: false })
  payment: {
    method: PaymentMethod;
    address: address;
  };

  @Column({ type: 'jsonb', nullable: false })
  delivery: {
    company: DeliveryCompany;
    address: address;
  };

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'enum', enum: OrderStatus, nullable: false })
  status: OrderStatus;

  @Column({ type: 'integer', nullable: false })
  total: number;
}
