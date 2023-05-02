import { Injectable } from '@nestjs/common';
import { Cart as ICart, CartItem as ICartItem } from '../models';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart, CartStatus } from '../../database/entities/cart.entity';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { CartItem } from '../../database/entities/cart-item.entity';
import { Product } from '../../database/entities/product.entity';

@Injectable()
export class CartService {
  private userCarts: Record<string, any> = {};

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async findByUserId(userId: string): Promise<ICart> {
    return await this.cartRepository.findOne({
      where: { user: { id: userId }, status: CartStatus.OPEN },
      relations: ['items', 'items.product'],
    });
  }

  async createByUserId(userId: string) {
    const user = await this.userRepository.findOne(userId);
    const cart = this.cartRepository.create({
      user: user,
      items: [],
      status: CartStatus.OPEN,
    });

    return await this.cartRepository.save(cart);
  }

  async findOrCreateByUserId(userId: string): Promise<ICart> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  async updateByUserId(
    userId: string,
    cartItemData: ICartItem,
  ): Promise<ICart> {
    const cart = await this.findOrCreateByUserId(userId);

    const cartItem = cart.items.find(
      ({ product }) => product.id === cartItemData.product.id,
    );

    if (!cartItem) {
      let product = await this.productRepository.findOne(
        cartItemData.product.id,
      );
      if (!product) {
        product = this.productRepository.create(cartItemData.product);
        product = await this.productRepository.save(product);
      }
      const newCartItem = this.cartItemRepository.create({
        count: cartItemData.count,
        product,
      });
      cart.items.push(newCartItem);
    } else {
      cartItem.count = cartItemData.count;
    }

    return await this.cartRepository.save(cart);
  }

  removeByUserId(userId): void {
    this.userCarts[userId] = null;
  }
}
