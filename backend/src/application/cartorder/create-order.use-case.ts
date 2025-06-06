import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Order, CreateOrderRequest } from "../../domain/cartorder/order.entity";
import { CartStatus } from "../../domain/cartorder/cart.entity";
import {
  CartOrderRepository,
  CART_ORDER_REPOSITORY,
} from "../../domain/cartorder/cartorder.port";

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(CART_ORDER_REPOSITORY)
    private readonly cartOrderRepository: CartOrderRepository,
  ) {}

  async execute(request: CreateOrderRequest): Promise<Order> {
    // Verify cart exists and belongs to user
    const cart = await this.cartOrderRepository.getCartById(request.cartId);

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${request.cartId} not found`);
    }

    if (cart.userId !== request.userId) {
      throw new BadRequestException(
        "Cart does not belong to the specified user",
      );
    }

    if (cart.status !== CartStatus.ACTIVE) {
      throw new BadRequestException("Cart is not active");
    }

    if (cart.items.length === 0) {
      throw new BadRequestException("Cannot create order from empty cart");
    }

    // Create order from cart
    const order = await this.cartOrderRepository.createOrder(request);

    // Mark cart as converted
    // Note: This would typically be handled in the repository implementation
    // to ensure atomicity

    return order;
  }
}
