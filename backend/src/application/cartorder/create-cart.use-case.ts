import { Injectable, Inject } from "@nestjs/common";
import { Cart, CreateCartRequest } from "../../domain/cartorder/cart.entity";
import {
  CartOrderRepository,
  CART_ORDER_REPOSITORY,
} from "../../domain/cartorder/cartorder.port";

@Injectable()
export class CreateCartUseCase {
  constructor(
    @Inject(CART_ORDER_REPOSITORY)
    private readonly cartOrderRepository: CartOrderRepository,
  ) {}

  async execute(request: CreateCartRequest): Promise<Cart> {
    // Check if user already has an active cart
    const existingCart = await this.cartOrderRepository.getCartByUserId(
      request.userId,
    );

    if (existingCart && existingCart.status === "active") {
      return existingCart;
    }

    return this.cartOrderRepository.createCart(request);
  }
}
