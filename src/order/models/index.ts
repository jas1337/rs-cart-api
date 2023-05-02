import { CartItem } from '../../cart/models';
import {
  PaymentMethod,
  address,
  DeliveryCompany,
  OrderStatus,
} from '../../database/entities/order.entity';

export type Order = {
  id?: string;
  user: {
    id: string;
  };
  cart: {
    id: string;
    items: CartItem[];
  };
  payment: {
    method: PaymentMethod;
    address: address;
  };
  delivery: {
    company: DeliveryCompany;
    address: address;
  };
  comments: string;
  status: OrderStatus;
  total: number;
};
