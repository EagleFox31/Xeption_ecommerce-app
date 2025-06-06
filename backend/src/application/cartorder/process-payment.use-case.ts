import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import {
  Payment,
  CreatePaymentRequest,
  ProcessPaymentRequest,
  PaymentStatus,
} from "../../domain/cartorder/payment.entity";
import {
  CartOrderRepository,
  CART_ORDER_REPOSITORY,
} from "../../domain/cartorder/cartorder.port";

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(CART_ORDER_REPOSITORY)
    private readonly cartOrderRepository: CartOrderRepository,
  ) {}

  async createPayment(request: CreatePaymentRequest): Promise<Payment> {
    // Verify order exists and belongs to user
    const order = await this.cartOrderRepository.getOrderById(request.orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${request.orderId} not found`);
    }

    if (order.userId !== request.userId) {
      throw new BadRequestException(
        "Order does not belong to the specified user",
      );
    }

    // Verify payment amount matches order total
    if (request.amount !== order.totalAmount) {
      throw new BadRequestException(
        "Payment amount does not match order total",
      );
    }

    return this.cartOrderRepository.createPayment(request);
  }

  async processPayment(request: ProcessPaymentRequest): Promise<Payment> {
    const payment = await this.cartOrderRepository.getPaymentById(
      request.paymentId,
    );

    if (!payment) {
      throw new NotFoundException(
        `Payment with ID ${request.paymentId} not found`,
      );
    }

    if (
      payment.status !== PaymentStatus.PENDING &&
      payment.status !== PaymentStatus.PROCESSING
    ) {
      throw new BadRequestException(
        `Cannot process payment with status ${payment.status}`,
      );
    }

    return this.cartOrderRepository.processPayment(request);
  }

  async getPaymentById(paymentId: string): Promise<Payment> {
    const payment = await this.cartOrderRepository.getPaymentById(paymentId);

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    return payment;
  }

  async getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
    return this.cartOrderRepository.getPaymentsByOrderId(orderId);
  }

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    return this.cartOrderRepository.getPaymentsByUserId(userId);
  }
}
