import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CartOrderRepository,
  CART_ORDER_REPOSITORY,
} from '../../../domain/cartorder/cartorder.port';
import {
  Cart,
  CartItem,
  CartStatus,
  CreateCartRequest,
  AddCartItemRequest,
  UpdateCartItemRequest,
  RemoveCartItemRequest,
} from '../../../domain/cartorder/cart.entity';
import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus as OrderPaymentStatus,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  ShippingAddress,
} from '../../../domain/cartorder/order.entity';
import {
  Payment,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  CreatePaymentRequest,
  ProcessPaymentRequest,
} from '../../../domain/cartorder/payment.entity';
import {
  OrderStatusEnum,
  PaymentMethodEnum,
  PaymentStatusEnum
} from '@prisma/client';

@Injectable()
export class PrismaCartOrderRepository implements CartOrderRepository {
  constructor(private prisma: PrismaService) {}

  // Helper functions for mapping between domain entities and Prisma models
  private mapPrismaCartToDomain(
    prismaCart: any,
    prismaCartItems?: any[],
  ): Cart {
    // Calculate total amount from cart items
    const items = prismaCartItems?.map(this.mapPrismaCartItemToDomain) || [];
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      id: prismaCart.userId, // Using userId as cart id since it's a 1:1 relationship
      userId: prismaCart.userId,
      items,
      totalAmount,
      currency: 'XAF', // Default currency
      status: this.determinateCartStatus(prismaCart), // Determine status based on cart data
      createdAt: prismaCart.createdAt,
      updatedAt: prismaCart.updatedAt,
    };
  }

  private determinateCartStatus(prismaCart: any): CartStatus {
    // Logic to determine cart status
    // This could be enhanced based on business rules
    return CartStatus.ACTIVE; // Default to active
  }

  private mapPrismaCartItemToDomain(prismaCartItem: any): CartItem {
    return {
      id: prismaCartItem.id.toString(), // Convert BigInt to string
      productId: prismaCartItem.productId.toString(), // Convert BigInt to string
      quantity: prismaCartItem.qty,
      unitPrice: parseFloat(prismaCartItem.product?.priceXaf?.toString() || '0'),
      totalPrice: 
        parseFloat(prismaCartItem.product?.priceXaf?.toString() || '0') * prismaCartItem.qty,
      createdAt: new Date(), // Not stored in Prisma model, using current date
      updatedAt: new Date(), // Not stored in Prisma model, using current date
    };
  }

  private mapPrismaOrderToDomain(prismaOrder: any, prismaOrderItems?: any[]): Order {
    const items = prismaOrderItems?.map(this.mapPrismaOrderItemToDomain) || [];
    
    // Map prisma address to domain shipping address
    const shippingAddress: ShippingAddress = prismaOrder.deliveryAddress 
      ? {
          street: prismaOrder.deliveryAddress.addressLine,
          city: prismaOrder.deliveryAddress.city?.name || '',
          state: prismaOrder.deliveryAddress.region?.name || '',
          postalCode: '', // Not available in Prisma model
          country: prismaOrder.deliveryAddress.country,
          phone: '', // Not directly available in Prisma model
        }
      : {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
        };

    return {
      id: prismaOrder.id,
      userId: prismaOrder.userId,
      orderNumber: prismaOrder.id, // Using ID as order number
      items,
      subtotal: parseFloat(prismaOrder.amountXaf.toString()),
      shippingCost: parseFloat(prismaOrder.shippingFeeXaf?.toString() || '0'),
      taxAmount: parseFloat(prismaOrder.taxXaf?.toString() || '0'),
      totalAmount: parseFloat(prismaOrder.amountXaf.toString()),
      currency: 'XAF', // Default currency
      status: this.mapPrismaOrderStatusToDomain(prismaOrder.status),
      paymentStatus: this.mapPrismaPaymentStatusToDomain(prismaOrder.paymentStatus),
      shippingAddress,
      billingAddress: shippingAddress, // Using shipping address as billing address
      createdAt: prismaOrder.createdAt,
      updatedAt: prismaOrder.updatedAt,
    };
  }

  private mapPrismaOrderItemToDomain(prismaOrderItem: any): OrderItem {
    return {
      id: prismaOrderItem.id.toString(), // Convert BigInt to string
      productId: prismaOrderItem.productId.toString(), // Convert BigInt to string
      quantity: prismaOrderItem.qty,
      unitPrice: parseFloat(prismaOrderItem.unitPriceXaf.toString()),
      totalPrice: parseFloat(prismaOrderItem.unitPriceXaf.toString()) * prismaOrderItem.qty,
    };
  }

  private mapPrismaOrderStatusToDomain(prismaStatus: OrderStatusEnum): OrderStatus {
    const statusMap: Record<OrderStatusEnum, OrderStatus> = {
      [OrderStatusEnum.new]: OrderStatus.PENDING,
      [OrderStatusEnum.processing]: OrderStatus.PROCESSING,
      [OrderStatusEnum.shipped]: OrderStatus.SHIPPED,
      [OrderStatusEnum.delivered]: OrderStatus.DELIVERED,
      [OrderStatusEnum.cancelled]: OrderStatus.CANCELLED,
    };
    return statusMap[prismaStatus] || OrderStatus.PENDING;
  }

  private mapDomainOrderStatusToPrisma(domainStatus: OrderStatus): OrderStatusEnum {
    const statusMap: Record<OrderStatus, OrderStatusEnum> = {
      [OrderStatus.PENDING]: OrderStatusEnum.new,
      [OrderStatus.CONFIRMED]: OrderStatusEnum.processing,
      [OrderStatus.PROCESSING]: OrderStatusEnum.processing,
      [OrderStatus.SHIPPED]: OrderStatusEnum.shipped,
      [OrderStatus.DELIVERED]: OrderStatusEnum.delivered,
      [OrderStatus.CANCELLED]: OrderStatusEnum.cancelled,
      [OrderStatus.RETURNED]: OrderStatusEnum.cancelled, // No direct mapping, using cancelled
    };
    return statusMap[domainStatus] || OrderStatusEnum.new;
  }

  private mapPrismaPaymentStatusToDomain(prismaStatus: PaymentStatusEnum): OrderPaymentStatus {
    const statusMap: Record<PaymentStatusEnum, OrderPaymentStatus> = {
      [PaymentStatusEnum.pending]: OrderPaymentStatus.PENDING,
      [PaymentStatusEnum.paid]: OrderPaymentStatus.PAID,
      [PaymentStatusEnum.failed]: OrderPaymentStatus.FAILED,
      [PaymentStatusEnum.refunded]: OrderPaymentStatus.REFUNDED,
    };
    return statusMap[prismaStatus] || OrderPaymentStatus.PENDING;
  }

  private mapDomainPaymentStatusToPrisma(domainStatus: OrderPaymentStatus): PaymentStatusEnum {
    const statusMap: Record<OrderPaymentStatus, PaymentStatusEnum> = {
      [OrderPaymentStatus.PENDING]: PaymentStatusEnum.pending,
      [OrderPaymentStatus.PAID]: PaymentStatusEnum.paid,
      [OrderPaymentStatus.FAILED]: PaymentStatusEnum.failed,
      [OrderPaymentStatus.REFUNDED]: PaymentStatusEnum.refunded,
      [OrderPaymentStatus.PARTIALLY_REFUNDED]: PaymentStatusEnum.refunded, // No direct mapping, using refunded
    };
    return statusMap[domainStatus] || PaymentStatusEnum.pending;
  }

  // Payment mapping
  // Note: Since there's no dedicated Payment model in Prisma,
  // we'll simulate payments using Order data
  private mapOrderToPayment(order: any): Payment {
    return {
      id: `payment-${order.id}`, // Simulated payment ID
      orderId: order.id,
      userId: order.userId,
      amount: parseFloat(order.amountXaf.toString()),
      currency: 'XAF',
      paymentMethod: this.mapPrismaPaymentMethodToDomain(order.paymentMethod),
      paymentProvider: this.determinePaymentProvider(order.paymentMethod),
      status: this.mapOrderPaymentStatusToPaymentStatus(order.paymentStatus),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private mapPrismaPaymentMethodToDomain(prismaMethod?: string): PaymentMethod {
    const methodMap: Record<string, PaymentMethod> = {
      'om': PaymentMethod.MOBILE_MONEY,
      'momo': PaymentMethod.MOBILE_MONEY,
      'card': PaymentMethod.CREDIT_CARD,
      'cash': PaymentMethod.CASH_ON_DELIVERY,
      'paypal': PaymentMethod.CREDIT_CARD,
    };
    return prismaMethod ? methodMap[prismaMethod] || PaymentMethod.CREDIT_CARD : PaymentMethod.CREDIT_CARD;
  }

  private determinePaymentProvider(prismaMethod?: string): PaymentProvider {
    const providerMap: Record<string, PaymentProvider> = {
      'om': PaymentProvider.ORANGE_MONEY,
      'momo': PaymentProvider.MTN_MONEY,
      'card': PaymentProvider.STRIPE,
      'cash': PaymentProvider.CINETPAY, // Default for cash
      'paypal': PaymentProvider.PAYPAL,
    };
    return prismaMethod ? providerMap[prismaMethod] || PaymentProvider.CINETPAY : PaymentProvider.CINETPAY;
  }

  private mapOrderPaymentStatusToPaymentStatus(orderPaymentStatus: PaymentStatusEnum): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      [PaymentStatusEnum.pending]: PaymentStatus.PENDING,
      [PaymentStatusEnum.paid]: PaymentStatus.COMPLETED,
      [PaymentStatusEnum.failed]: PaymentStatus.FAILED,
      [PaymentStatusEnum.refunded]: PaymentStatus.REFUNDED,
    };
    return statusMap[orderPaymentStatus] || PaymentStatus.PENDING;
  }

  private mapPaymentStatusToOrderPaymentStatus(paymentStatus: PaymentStatus): PaymentStatusEnum {
    const statusMap: Record<string, PaymentStatusEnum> = {
      [PaymentStatus.PENDING]: PaymentStatusEnum.pending,
      [PaymentStatus.PROCESSING]: PaymentStatusEnum.pending,
      [PaymentStatus.COMPLETED]: PaymentStatusEnum.paid,
      [PaymentStatus.FAILED]: PaymentStatusEnum.failed,
      [PaymentStatus.CANCELLED]: PaymentStatusEnum.failed,
      [PaymentStatus.REFUNDED]: PaymentStatusEnum.refunded,
    };
    return statusMap[paymentStatus] || PaymentStatusEnum.pending;
  }

  // CART OPERATIONS
  async createCart(request: CreateCartRequest): Promise<Cart> {
    const existingCart = await this.prisma.cart.findUnique({
      where: { userId: request.userId },
      include: { items: { include: { product: true } } },
    });

    if (existingCart) {
      return this.mapPrismaCartToDomain(existingCart, existingCart.items);
    }

    const newCart = await this.prisma.cart.create({
      data: {
        userId: request.userId,
      },
      include: { items: { include: { product: true } } },
    });

    return this.mapPrismaCartToDomain(newCart, []);
  }

  async getCartById(cartId: string): Promise<Cart | null> {
    // In our schema, cartId is actually userId (1:1 relationship)
    const cart = await this.prisma.cart.findUnique({
      where: { userId: cartId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) return null;
    return this.mapPrismaCartToDomain(cart, cart.items);
  }

  async getCartByUserId(userId: string): Promise<Cart | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) return null;
    return this.mapPrismaCartToDomain(cart, cart.items);
  }

  async addCartItem(request: AddCartItemRequest): Promise<Cart> {
    // Convert productId to BigInt (since it's a BigInt in Prisma)
    const productIdBigInt = BigInt(request.productId);

    // First, check if the item already exists in the cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartUserId: request.cartId,
        productId: productIdBigInt,
      },
    });

    if (existingItem) {
      // Update quantity if item exists
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { qty: existingItem.qty + request.quantity },
      });
    } else {
      // Create new item if it doesn't exist
      await this.prisma.cartItem.create({
        data: {
          cartUserId: request.cartId,
          productId: productIdBigInt,
          qty: request.quantity,
        },
      });
    }

    // Return updated cart
    const updatedCart = await this.prisma.cart.findUnique({
      where: { userId: request.cartId },
      include: { items: { include: { product: true } } },
    });

    return this.mapPrismaCartToDomain(updatedCart, updatedCart.items);
  }

  async updateCartItem(request: UpdateCartItemRequest): Promise<Cart> {
    // Convert itemId to BigInt
    const itemIdBigInt = BigInt(request.itemId);

    // Update cart item
    await this.prisma.cartItem.update({
      where: { id: itemIdBigInt },
      data: { qty: request.quantity },
    });

    // Return updated cart
    const updatedCart = await this.prisma.cart.findUnique({
      where: { userId: request.cartId },
      include: { items: { include: { product: true } } },
    });

    return this.mapPrismaCartToDomain(updatedCart, updatedCart.items);
  }

  async removeCartItem(request: RemoveCartItemRequest): Promise<Cart> {
    // Convert itemId to BigInt
    const itemIdBigInt = BigInt(request.itemId);

    // Delete cart item
    await this.prisma.cartItem.delete({
      where: { id: itemIdBigInt },
    });

    // Return updated cart
    const updatedCart = await this.prisma.cart.findUnique({
      where: { userId: request.cartId },
      include: { items: { include: { product: true } } },
    });

    return this.mapPrismaCartToDomain(updatedCart, updatedCart.items);
  }

  async clearCart(cartId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({
      where: { cartUserId: cartId },
    });
  }

  async deleteCart(cartId: string): Promise<void> {
    // First delete all cart items
    await this.prisma.cartItem.deleteMany({
      where: { cartUserId: cartId },
    });

    // Then delete the cart
    await this.prisma.cart.delete({
      where: { userId: cartId },
    });
  }

  // ORDER OPERATIONS
  async createOrder(request: CreateOrderRequest): Promise<Order> {
    // Get the cart to convert to an order
    const cart = await this.prisma.cart.findUnique({
      where: { userId: request.cartId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty or does not exist');
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + parseFloat(item.product.priceXaf.toString()) * item.qty, 
      0
    );

    // Start a transaction to ensure all operations succeed or fail together
    const order = await this.prisma.$transaction(async (prisma) => {
      // Create order
      const newOrder = await prisma.order.create({
        data: {
          userId: request.userId,
          amountXaf: totalAmount,
          status: OrderStatusEnum.new,
          paymentStatus: PaymentStatusEnum.pending,
          deliveryMethod: 'standard', // Default method
          // Address handling (requires Address id)
          // This would need to be enhanced to create or reference an existing address
        },
      });

      // Create order items from cart items
      for (const cartItem of cart.items) {
        await prisma.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: cartItem.productId,
            variantId: cartItem.variantId,
            qty: cartItem.qty,
            unitPriceXaf: cartItem.product.priceXaf,
          },
        });
      }

      // Update cart status to converted (by clearing cart items)
      await prisma.cartItem.deleteMany({
        where: { cartUserId: cart.userId },
      });

      return newOrder;
    });

    // Fetch complete order with items
    const completeOrder = await this.prisma.order.findUnique({
      where: { id: order.id },
      include: { 
        items: true,
        deliveryAddress: {
          include: {
            region: true,
            city: true,
            commune: true,
          },
        },
      },
    });

    return this.mapPrismaOrderToDomain(completeOrder, completeOrder.items);
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: true,
        deliveryAddress: {
          include: {
            region: true,
            city: true,
            commune: true,
          },
        },
      },
    });

    if (!order) return null;
    return this.mapPrismaOrderToDomain(order, order.items);
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { 
        items: true,
        deliveryAddress: {
          include: {
            region: true,
            city: true,
            commune: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => this.mapPrismaOrderToDomain(order, order.items));
  }

  async updateOrderStatus(request: UpdateOrderStatusRequest): Promise<Order> {
    const orderStatus = this.mapDomainOrderStatusToPrisma(request.status);
    
    const updatedOrder = await this.prisma.order.update({
      where: { id: request.orderId },
      data: {
        status: orderStatus
      },
      include: {
        items: true,
        deliveryAddress: {
          include: {
            region: true,
            city: true,
            commune: true,
          },
        },
      },
    });

    return this.mapPrismaOrderToDomain(updatedOrder, updatedOrder.items || []);
  }

  async deleteOrder(orderId: string): Promise<void> {
    // First delete all order items
    await this.prisma.orderItem.deleteMany({
      where: { orderId },
    });

    // Then delete the order
    await this.prisma.order.delete({
      where: { id: orderId },
    });
  }

  // PAYMENT OPERATIONS
  // Note: Since there's no dedicated Payment table, we're simulating payments
  // using the payment-related fields in the Order table
  async createPayment(request: CreatePaymentRequest): Promise<Payment> {
    // Update the order with payment information
    const paymentMethod = this.mapPaymentMethodToPrisma(request.paymentMethod);
    
    const order = await this.prisma.order.update({
      where: { id: request.orderId },
      data: {
        paymentMethod: paymentMethod,
        // Store any additional payment metadata if needed
      },
    });

    // Return simulated payment
    return this.mapOrderToPayment(order);
  }

  private mapPaymentMethodToPrisma(method: PaymentMethod): PaymentMethodEnum {
    const methodMap: Record<string, PaymentMethodEnum> = {
      [PaymentMethod.CREDIT_CARD]: PaymentMethodEnum.card,
      [PaymentMethod.DEBIT_CARD]: PaymentMethodEnum.card,
      [PaymentMethod.MOBILE_MONEY]: PaymentMethodEnum.momo, // Default to MTN Money
      [PaymentMethod.BANK_TRANSFER]: PaymentMethodEnum.card,
      [PaymentMethod.CASH_ON_DELIVERY]: PaymentMethodEnum.cash,
    };
    return methodMap[method] || PaymentMethodEnum.card;
  }

  async getPaymentById(paymentId: string): Promise<Payment | null> {
    // Extract orderId from paymentId (format: payment-{orderId})
    const orderId = paymentId.replace('payment-', '');
    
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return null;
    return this.mapOrderToPayment(order);
  }

  async getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return [];
    return [this.mapOrderToPayment(order)];
  }

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
    });

    return orders.map(this.mapOrderToPayment);
  }

  async processPayment(request: ProcessPaymentRequest): Promise<Payment> {
    // Extract orderId from paymentId
    const orderId = request.paymentId.replace('payment-', '');
    
    // Get payment status
    const paymentStatus = this.mapPaymentStatusToOrderPaymentStatus(request.status);
    
    // Update order with payment status
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: paymentStatus,
        // You could store transaction ID in a JSON field or notes if needed
      },
    });

    return this.mapOrderToPayment(updatedOrder);
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
  ): Promise<Payment> {
    // Extract orderId from paymentId
    const orderId = paymentId.replace('payment-', '');
    
    // Get payment status
    const paymentStatus = this.mapPaymentStatusToOrderPaymentStatus(status);
    
    // Update order with payment status
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: paymentStatus,
      },
    });

    return this.mapOrderToPayment(updatedOrder);
  }

  // Additional method for generating invoice details (not in the original interface)
  async getOrderInvoice(orderId: string): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: { 
          include: { product: true } 
        },
        user: true,
        deliveryAddress: {
          include: {
            region: true,
            city: true,
            commune: true,
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    // Format invoice data
    return {
      invoiceNumber: `INV-${order.id.substring(0, 8)}`,
      invoiceDate: order.createdAt,
      order: this.mapPrismaOrderToDomain(order, order.items),
      customer: {
        name: order.user.fullName,
        email: order.user.email,
        phone: order.user.phone237,
      },
      paymentDetails: {
        method: order.paymentMethod,
        status: order.paymentStatus,
      },
      items: order.items.map(item => ({
        id: item.id.toString(),
        productId: item.productId.toString(),
        name: item.product.name,
        quantity: item.qty,
        unitPrice: parseFloat(item.unitPriceXaf.toString()),
        totalPrice: parseFloat(item.unitPriceXaf.toString()) * item.qty,
      })),
      totals: {
        subtotal: parseFloat(order.amountXaf.toString()) - 
                 parseFloat(order.shippingFeeXaf?.toString() || '0') - 
                 parseFloat(order.taxXaf?.toString() || '0'),
        shipping: parseFloat(order.shippingFeeXaf?.toString() || '0'),
        tax: parseFloat(order.taxXaf?.toString() || '0'),
        discount: parseFloat(order.discountXaf?.toString() || '0'),
        total: parseFloat(order.amountXaf.toString()),
      },
      currency: 'XAF',
    };
  }
}