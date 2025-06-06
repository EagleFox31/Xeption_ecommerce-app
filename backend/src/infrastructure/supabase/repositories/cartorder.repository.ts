import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { CartOrderRepository } from "../../../domain/cartorder/cartorder.port";
import {
  Cart,
  CartItem,
  CartStatus,
  CreateCartRequest,
  AddCartItemRequest,
  UpdateCartItemRequest,
  RemoveCartItemRequest,
} from "../../../domain/cartorder/cart.entity";
import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
} from "../../../domain/cartorder/order.entity";
import {
  Payment,
  CreatePaymentRequest,
  ProcessPaymentRequest,
} from "../../../domain/cartorder/payment.entity";

@Injectable()
export class SupabaseCartOrderRepository implements CartOrderRepository {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );
  }

  // Cart operations
  async createCart(request: CreateCartRequest): Promise<Cart> {
    const { data, error } = await this.supabase
      .from("carts")
      .insert({
        user_id: request.userId,
        total_amount: 0,
        currency: "XAF",
        status: CartStatus.ACTIVE,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create cart: ${error.message}`);
    }

    return this.mapToCart(data);
  }

  async getCartById(cartId: string): Promise<Cart | null> {
    const { data, error } = await this.supabase
      .from("carts")
      .select(
        `
        *,
        cart_items (
          id,
          product_id,
          quantity,
          unit_price,
          total_price,
          created_at,
          updated_at
        )
      `,
      )
      .eq("id", cartId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to get cart: ${error.message}`);
    }

    return data ? this.mapToCart(data) : null;
  }

  async getCartByUserId(userId: string): Promise<Cart | null> {
    const { data, error } = await this.supabase
      .from("carts")
      .select(
        `
        *,
        cart_items (
          id,
          product_id,
          quantity,
          unit_price,
          total_price,
          created_at,
          updated_at
        )
      `,
      )
      .eq("user_id", userId)
      .eq("status", CartStatus.ACTIVE)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to get cart: ${error.message}`);
    }

    return data ? this.mapToCart(data) : null;
  }

  async addCartItem(request: AddCartItemRequest): Promise<Cart> {
    const { error } = await this.supabase.from("cart_items").insert({
      cart_id: request.cartId,
      product_id: request.productId,
      quantity: request.quantity,
      unit_price: request.unitPrice,
      total_price: request.quantity * request.unitPrice,
    });

    if (error) {
      throw new Error(`Failed to add cart item: ${error.message}`);
    }

    // Update cart total
    await this.updateCartTotal(request.cartId);

    return this.getCartById(request.cartId)!;
  }

  async updateCartItem(request: UpdateCartItemRequest): Promise<Cart> {
    // Get current item to calculate new total
    const { data: item } = await this.supabase
      .from("cart_items")
      .select("unit_price")
      .eq("id", request.itemId)
      .single();

    if (!item) {
      throw new Error("Cart item not found");
    }

    const { error } = await this.supabase
      .from("cart_items")
      .update({
        quantity: request.quantity,
        total_price: request.quantity * item.unit_price,
      })
      .eq("id", request.itemId);

    if (error) {
      throw new Error(`Failed to update cart item: ${error.message}`);
    }

    // Update cart total
    await this.updateCartTotal(request.cartId);

    return this.getCartById(request.cartId)!;
  }

  async removeCartItem(request: RemoveCartItemRequest): Promise<Cart> {
    const { error } = await this.supabase
      .from("cart_items")
      .delete()
      .eq("id", request.itemId);

    if (error) {
      throw new Error(`Failed to remove cart item: ${error.message}`);
    }

    // Update cart total
    await this.updateCartTotal(request.cartId);

    return this.getCartById(request.cartId)!;
  }

  async clearCart(cartId: string): Promise<void> {
    const { error } = await this.supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId);

    if (error) {
      throw new Error(`Failed to clear cart: ${error.message}`);
    }

    // Update cart total
    await this.updateCartTotal(cartId);
  }

  async deleteCart(cartId: string): Promise<void> {
    const { error } = await this.supabase
      .from("carts")
      .delete()
      .eq("id", cartId);

    if (error) {
      throw new Error(`Failed to delete cart: ${error.message}`);
    }
  }

  // Order operations
  async createOrder(request: CreateOrderRequest): Promise<Order> {
    // Get cart data
    const cart = await this.getCartById(request.cartId);
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate totals
    const subtotal = cart.totalAmount;
    const shippingCost = 0; // TODO: Calculate shipping
    const taxAmount = 0; // TODO: Calculate tax
    const totalAmount = subtotal + shippingCost + taxAmount;

    const { data, error } = await this.supabase
      .from("orders")
      .insert({
        user_id: request.userId,
        order_number: orderNumber,
        subtotal,
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        currency: cart.currency,
        status: OrderStatus.PENDING,
        payment_status: PaymentStatus.PENDING,
        shipping_address: request.shippingAddress,
        billing_address: request.billingAddress,
        notes: request.notes,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }

    // Create order items
    const orderItems = cart.items.map((item) => ({
      order_id: data.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
    }));

    const { error: itemsError } = await this.supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // Mark cart as converted
    await this.supabase
      .from("carts")
      .update({ status: CartStatus.CONVERTED })
      .eq("id", request.cartId);

    return this.getOrderById(data.id)!;
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          total_price
        )
      `,
      )
      .eq("id", orderId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to get order: ${error.message}`);
    }

    return data ? this.mapToOrder(data) : null;
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          total_price
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get orders: ${error.message}`);
    }

    return data.map(this.mapToOrder);
  }

  async updateOrderStatus(request: UpdateOrderStatusRequest): Promise<Order> {
    const { error } = await this.supabase
      .from("orders")
      .update({ status: request.status })
      .eq("id", request.orderId);

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }

    return this.getOrderById(request.orderId)!;
  }

  async deleteOrder(orderId: string): Promise<void> {
    const { error } = await this.supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      throw new Error(`Failed to delete order: ${error.message}`);
    }
  }

  // Payment operations
  async createPayment(request: CreatePaymentRequest): Promise<Payment> {
    const { data, error } = await this.supabase
      .from("payments")
      .insert({
        order_id: request.orderId,
        user_id: request.userId,
        amount: request.amount,
        currency: request.currency,
        payment_method: request.paymentMethod,
        payment_provider: request.paymentProvider,
        status: PaymentStatus.PENDING,
        metadata: request.metadata,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create payment: ${error.message}`);
    }

    return this.mapToPayment(data);
  }

  async getPaymentById(paymentId: string): Promise<Payment | null> {
    const { data, error } = await this.supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to get payment: ${error.message}`);
    }

    return data ? this.mapToPayment(data) : null;
  }

  async getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from("payments")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get payments: ${error.message}`);
    }

    return data.map(this.mapToPayment);
  }

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get payments: ${error.message}`);
    }

    return data.map(this.mapToPayment);
  }

  async processPayment(request: ProcessPaymentRequest): Promise<Payment> {
    const { error } = await this.supabase
      .from("payments")
      .update({
        transaction_id: request.transactionId,
        status: request.status,
        failure_reason: request.failureReason,
      })
      .eq("id", request.paymentId);

    if (error) {
      throw new Error(`Failed to process payment: ${error.message}`);
    }

    return this.getPaymentById(request.paymentId)!;
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
  ): Promise<Payment> {
    const { error } = await this.supabase
      .from("payments")
      .update({ status })
      .eq("id", paymentId);

    if (error) {
      throw new Error(`Failed to update payment status: ${error.message}`);
    }

    return this.getPaymentById(paymentId)!;
  }

  // Helper methods
  private async updateCartTotal(cartId: string): Promise<void> {
    const { data } = await this.supabase
      .from("cart_items")
      .select("total_price")
      .eq("cart_id", cartId);

    const totalAmount =
      data?.reduce((sum, item) => sum + item.total_price, 0) || 0;

    await this.supabase
      .from("carts")
      .update({ total_amount: totalAmount })
      .eq("id", cartId);
  }

  private mapToCart(data: any): Cart {
    return {
      id: data.id,
      userId: data.user_id,
      items: data.cart_items?.map(this.mapToCartItem) || [],
      totalAmount: data.total_amount,
      currency: data.currency,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapToCartItem(data: any): CartItem {
    return {
      id: data.id,
      productId: data.product_id,
      quantity: data.quantity,
      unitPrice: data.unit_price,
      totalPrice: data.total_price,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapToOrder(data: any): Order {
    return {
      id: data.id,
      userId: data.user_id,
      orderNumber: data.order_number,
      items: data.order_items?.map(this.mapToOrderItem) || [],
      subtotal: data.subtotal,
      shippingCost: data.shipping_cost,
      taxAmount: data.tax_amount,
      totalAmount: data.total_amount,
      currency: data.currency,
      status: data.status,
      paymentStatus: data.payment_status,
      shippingAddress: data.shipping_address,
      billingAddress: data.billing_address,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapToOrderItem(data: any): OrderItem {
    return {
      id: data.id,
      productId: data.product_id,
      quantity: data.quantity,
      unitPrice: data.unit_price,
      totalPrice: data.total_price,
    };
  }

  private mapToPayment(data: any): Payment {
    return {
      id: data.id,
      orderId: data.order_id,
      userId: data.user_id,
      amount: data.amount,
      currency: data.currency,
      paymentMethod: data.payment_method,
      paymentProvider: data.payment_provider,
      transactionId: data.transaction_id,
      status: data.status,
      failureReason: data.failure_reason,
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
