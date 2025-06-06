import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import {
  Cart,
  AddCartItemRequest,
  UpdateCartItemRequest,
  RemoveCartItemRequest,
} from "../../domain/cartorder/cart.entity";
import {
  CartOrderRepository,
  CART_ORDER_REPOSITORY,
} from "../../domain/cartorder/cartorder.port";

@Injectable()
export class UpdateCartUseCase {
  constructor(
    @Inject(CART_ORDER_REPOSITORY)
    private readonly cartOrderRepository: CartOrderRepository,
  ) {}

  async addItem(request: AddCartItemRequest): Promise<Cart> {
    const cart = await this.cartOrderRepository.getCartById(request.cartId);

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${request.cartId} not found`);
    }

    return this.cartOrderRepository.addCartItem(request);
  }

  async updateItem(request: UpdateCartItemRequest): Promise<Cart> {
    const cart = await this.cartOrderRepository.getCartById(request.cartId);

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${request.cartId} not found`);
    }

    return this.cartOrderRepository.updateCartItem(request);
  }

  async removeItem(request: RemoveCartItemRequest): Promise<Cart> {
    const cart = await this.cartOrderRepository.getCartById(request.cartId);

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${request.cartId} not found`);
    }

    return this.cartOrderRepository.removeCartItem(request);
  }

  async clearCart(cartId: string): Promise<void> {
    const cart = await this.cartOrderRepository.getCartById(cartId);

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    await this.cartOrderRepository.clearCart(cartId);
  }
}
