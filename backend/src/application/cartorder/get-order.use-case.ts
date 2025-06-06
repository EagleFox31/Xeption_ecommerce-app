import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { Order } from "../../domain/cartorder/order.entity";
import {
  CartOrderRepository,
  CART_ORDER_REPOSITORY,
} from "../../domain/cartorder/cartorder.port";

@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(CART_ORDER_REPOSITORY)
    private readonly cartOrderRepository: CartOrderRepository,
  ) {}

  async executeById(orderId: string): Promise<Order> {
    const order = await this.cartOrderRepository.getOrderById(orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async executeByUserId(userId: string): Promise<Order[]> {
    return this.cartOrderRepository.getOrdersByUserId(userId);
  }
}
