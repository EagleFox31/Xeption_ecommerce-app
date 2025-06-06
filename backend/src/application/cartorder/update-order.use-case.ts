import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import {
  Order,
  UpdateOrderStatusRequest,
  OrderStatus,
} from "../../domain/cartorder/order.entity";
import {
  CartOrderRepository,
  CART_ORDER_REPOSITORY,
} from "../../domain/cartorder/cartorder.port";

@Injectable()
export class UpdateOrderUseCase {
  constructor(
    @Inject(CART_ORDER_REPOSITORY)
    private readonly cartOrderRepository: CartOrderRepository,
  ) {}

  async updateStatus(request: UpdateOrderStatusRequest): Promise<Order> {
    const order = await this.cartOrderRepository.getOrderById(request.orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${request.orderId} not found`);
    }

    // Validate status transition
    if (!this.isValidStatusTransition(order.status, request.status)) {
      throw new BadRequestException(
        `Invalid status transition from ${order.status} to ${request.status}`,
      );
    }

    return this.cartOrderRepository.updateOrderStatus(request);
  }

  private isValidStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
      [OrderStatus.DELIVERED]: [OrderStatus.RETURNED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.RETURNED]: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}
