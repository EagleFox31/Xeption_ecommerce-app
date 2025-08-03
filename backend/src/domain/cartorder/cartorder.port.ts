import {
  Cart,
  CreateCartRequest,
  AddCartItemRequest,
  UpdateCartItemRequest,
  RemoveCartItemRequest,
} from "./cart.entity";
import {
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
} from "./order.entity";
import {
  Payment,
  CreatePaymentRequest,
  ProcessPaymentRequest,
  PaymentStatus
} from "./payment.entity";

export interface CartOrderRepository {
  // Cart operations
  createCart(request: CreateCartRequest): Promise<Cart>;
  getCartById(cartId: string): Promise<Cart | null>;
  getCartByUserId(userId: string): Promise<Cart | null>;
  addCartItem(request: AddCartItemRequest): Promise<Cart>;
  updateCartItem(request: UpdateCartItemRequest): Promise<Cart>;
  removeCartItem(request: RemoveCartItemRequest): Promise<Cart>;
  clearCart(cartId: string): Promise<void>;
  deleteCart(cartId: string): Promise<void>;

  // Order operations
  createOrder(request: CreateOrderRequest): Promise<Order>;
  getOrderById(orderId: string): Promise<Order | null>;
  getOrdersByUserId(userId: string): Promise<Order[]>;
  updateOrderStatus(request: UpdateOrderStatusRequest): Promise<Order>;
  deleteOrder(orderId: string): Promise<void>;
  getOrderInvoice(orderId: string): Promise<any>; // For detailed invoice data

  // Payment operations
  createPayment(request: CreatePaymentRequest): Promise<Payment>;
  getPaymentById(paymentId: string): Promise<Payment | null>;
  getPaymentsByOrderId(orderId: string): Promise<Payment[]>;
  getPaymentsByUserId(userId: string): Promise<Payment[]>;
  processPayment(request: ProcessPaymentRequest): Promise<Payment>;
  updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
  ): Promise<Payment>;
}

export const CART_ORDER_REPOSITORY = Symbol("CartOrderRepository");
