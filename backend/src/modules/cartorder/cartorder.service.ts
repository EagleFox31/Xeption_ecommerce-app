import { Injectable } from "@nestjs/common";
import { CreateCartUseCase } from "../../application/cartorder/create-cart.use-case";
import { GetCartUseCase } from "../../application/cartorder/get-cart.use-case";
import { UpdateCartUseCase } from "../../application/cartorder/update-cart.use-case";
import { CreateOrderUseCase } from "../../application/cartorder/create-order.use-case";
import { GetOrderUseCase } from "../../application/cartorder/get-order.use-case";
import { UpdateOrderUseCase } from "../../application/cartorder/update-order.use-case";
import { ProcessPaymentUseCase } from "../../application/cartorder/process-payment.use-case";
import {
  Cart,
  CreateCartRequest,
  AddCartItemRequest,
  UpdateCartItemRequest,
  RemoveCartItemRequest,
} from "../../domain/cartorder/cart.entity";
import {
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
} from "../../domain/cartorder/order.entity";
import {
  Payment,
  CreatePaymentRequest,
  ProcessPaymentRequest,
} from "../../domain/cartorder/payment.entity";

@Injectable()
export class CartOrderService {
  constructor(
    private readonly createCartUseCase: CreateCartUseCase,
    private readonly getCartUseCase: GetCartUseCase,
    private readonly updateCartUseCase: UpdateCartUseCase,
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly updateOrderUseCase: UpdateOrderUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
  ) {}

  // Cart operations
  async createCart(request: CreateCartRequest): Promise<Cart> {
    return this.createCartUseCase.execute(request);
  }

  async getCartById(cartId: string): Promise<Cart> {
    return this.getCartUseCase.executeById(cartId);
  }

  async getCartByUserId(userId: string): Promise<Cart | null> {
    return this.getCartUseCase.executeByUserId(userId);
  }

  async addCartItem(request: AddCartItemRequest): Promise<Cart> {
    return this.updateCartUseCase.addItem(request);
  }

  async updateCartItem(request: UpdateCartItemRequest): Promise<Cart> {
    return this.updateCartUseCase.updateItem(request);
  }

  async removeCartItem(request: RemoveCartItemRequest): Promise<Cart> {
    return this.updateCartUseCase.removeItem(request);
  }

  async clearCart(cartId: string): Promise<void> {
    return this.updateCartUseCase.clearCart(cartId);
  }

  async deleteCart(cartId: string): Promise<void> {
    // This would typically be handled by a dedicated use case
    // For now, we'll call the repository directly through a use case
    throw new Error("Delete cart not implemented");
  }

  // Order operations
  async createOrder(request: CreateOrderRequest): Promise<Order> {
    return this.createOrderUseCase.execute(request);
  }

  async getOrderById(orderId: string): Promise<Order> {
    return this.getOrderUseCase.executeById(orderId);
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return this.getOrderUseCase.executeByUserId(userId);
  }

  async updateOrderStatus(request: UpdateOrderStatusRequest): Promise<Order> {
    return this.updateOrderUseCase.updateStatus(request);
  }

  async deleteOrder(orderId: string): Promise<void> {
    // This would typically be handled by a dedicated use case
    throw new Error("Delete order not implemented");
  }

  // Payment operations
  async createPayment(request: CreatePaymentRequest): Promise<Payment> {
    return this.processPaymentUseCase.createPayment(request);
  }

  async getPaymentById(paymentId: string): Promise<Payment> {
    return this.processPaymentUseCase.getPaymentById(paymentId);
  }

  async getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
    return this.processPaymentUseCase.getPaymentsByOrderId(orderId);
  }

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    return this.processPaymentUseCase.getPaymentsByUserId(userId);
  }

  async processPayment(request: ProcessPaymentRequest): Promise<Payment> {
    return this.processPaymentUseCase.processPayment(request);
  }

  // Invoice operations
  async getOrderInvoice(orderId: string): Promise<any> {
    // Ensure the order exists first
    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    
    // This should use a repository method, but for now, we'll directly call it
    // In a real application, this should be handled by a dedicated use case
    return (this.updateOrderUseCase as any).repository.getOrderInvoice(orderId);
  }
}
