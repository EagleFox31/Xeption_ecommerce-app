import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { Cart } from "../../domain/cartorder/cart.entity";
import {
  CartOrderRepository,
  CART_ORDER_REPOSITORY,
} from "../../domain/cartorder/cartorder.port";

@Injectable()
export class GetCartUseCase {
  constructor(
    @Inject(CART_ORDER_REPOSITORY)
    private readonly cartOrderRepository: CartOrderRepository,
  ) {}

  async executeById(cartId: string): Promise<Cart> {
    const cart = await this.cartOrderRepository.getCartById(cartId);

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    return cart;
  }

  async executeByUserId(userId: string): Promise<Cart | null> {
    return this.cartOrderRepository.getCartByUserId(userId);
  }
}
