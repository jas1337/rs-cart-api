import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import {
  DeliveryCompany,
  Order,
  OrderStatus,
  PaymentMethod,
} from '../../database/entities/order.entity';
import { EntityManager, Repository } from 'typeorm';
import { Cart, CartStatus } from '../../database/entities/cart.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findById(orderId: string): Promise<Order> {
    return await this.orderRepository.findOne(orderId);
  }

  async findAllByUserId(userId: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { user: { id: userId } },
    });
  }

  async create({ userId, cartId, address, comments, total }): Promise<Order> {
    const order = this.orderRepository.create({
      user: {
        id: userId,
      },
      cart: {
        id: cartId,
      },
      payment: {
        method: PaymentMethod.ONLINE,
        address,
      },
      delivery: {
        company: DeliveryCompany.DPD,
        address,
      },
      comments,
      status: OrderStatus.OPEN,
      total,
    });

    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId }, status: CartStatus.OPEN },
    });
    cart.status = CartStatus.ORDERED;

    await this.entityManager.transaction(async transactionalEntityManager => {
      await transactionalEntityManager.save(cart);
      await transactionalEntityManager.save(order);
    });

    return order;
  }

  async update(orderId, data): Promise<Order> {
    const order = await this.findById(orderId);

    if (!order) {
      throw new Error('Order does not exist.');
    }

    this.orderRepository.merge(order, data);
    return await this.orderRepository.save(order);
  }
}
