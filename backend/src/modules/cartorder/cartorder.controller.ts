import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  Res,
  StreamableFile,
  Query,
} from "@nestjs/common";
import { Response } from "express";
import { AuthGuard } from "../../common/auth/auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { JwtPayload } from "../../common/auth/jwt.types";
import { CartOrderService } from "./cartorder.service";
import { InvoiceService } from "./invoice.service";
import {
  CreateCartDto,
  AddCartItemDto,
  UpdateCartItemDto,
  RemoveCartItemDto,
} from "./dto/cart.dto";
import { CreateOrderDto, UpdateOrderStatusDto } from "./dto/order.dto";
import { CreatePaymentDto, ProcessPaymentDto } from "./dto/payment.dto";

/**
 * CartOrder API Controller
 *
 * Restructured to clearly separate:
 * 1. Cart operations (/cart/*)
 * 2. Checkout operations (/checkout/*)
 * 3. Order management (/orders/*)
 * 4. Payment processing (/payments/*)
 */
@Controller("api/cartorder")
@UseGuards(AuthGuard)
export class CartOrderController {
  constructor(
    private readonly cartOrderService: CartOrderService,
    private readonly invoiceService: InvoiceService
  ) {}

  /**
   * CART OPERATIONS
   * Endpoints for managing the shopping cart
   */
  @Post("cart")
  @HttpCode(HttpStatus.CREATED)
  async createCart(
    @CurrentUser() user: JwtPayload,
    @Body() createCartDto: CreateCartDto,
  ) {
    return this.cartOrderService.createCart({
      userId: user.sub,
      ...createCartDto,
    });
  }

  @Get("cart")
  async getCurrentCart(@CurrentUser() user: JwtPayload) {
    return this.cartOrderService.getCartByUserId(user.sub);
  }

  @Get("cart/:cartId")
  async getCart(@Param("cartId") cartId: string) {
    return this.cartOrderService.getCartById(cartId);
  }

  /**
   * Add a single item to the cart
   * This endpoint allows adding one item at a time
   */
  @Post("cart/items")
  @HttpCode(HttpStatus.CREATED)
  async addSingleCartItem(
    @CurrentUser() user: JwtPayload,
    @Body() addCartItemDto: AddCartItemDto,
  ) {
    // First get the user's cart
    const cart = await this.cartOrderService.getCartByUserId(user.sub);
    if (!cart) {
      // Create a cart if it doesn't exist
      await this.cartOrderService.createCart({ userId: user.sub });
    }

    // Add item to the cart
    return this.cartOrderService.addCartItem({
      cartId: user.sub, // Using userId as cartId since it's a 1:1 relationship
      ...addCartItemDto,
    });
  }

  /**
   * Legacy endpoint - Add items to a specific cart
   */
  @Post("cart/:cartId/items")
  @HttpCode(HttpStatus.CREATED)
  async addCartItem(
    @Param("cartId") cartId: string,
    @Body() addCartItemDto: AddCartItemDto,
  ) {
    return this.cartOrderService.addCartItem({
      cartId,
      ...addCartItemDto,
    });
  }

  @Put("cart/:cartId/items/:itemId")
  async updateCartItem(
    @Param("cartId") cartId: string,
    @Param("itemId") itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartOrderService.updateCartItem({
      cartId,
      itemId,
      ...updateCartItemDto,
    });
  }

  @Delete("cart/:cartId/items/:itemId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCartItem(
    @Param("cartId") cartId: string,
    @Param("itemId") itemId: string,
  ) {
    return this.cartOrderService.removeCartItem({ cartId, itemId });
  }

  @Delete("cart/:cartId/clear")
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(@Param("cartId") cartId: string) {
    return this.cartOrderService.clearCart(cartId);
  }

  @Delete("cart/:cartId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCart(@Param("cartId") cartId: string) {
    return this.cartOrderService.deleteCart(cartId);
  }

  /**
   * CHECKOUT OPERATIONS
   * Endpoints for the checkout process (converting cart to order)
   */
  @Post("checkout")
  @HttpCode(HttpStatus.CREATED)
  async checkout(
    @CurrentUser() user: JwtPayload,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    // If cartId is not provided, use user's ID as cart ID
    const cartId = createOrderDto.cartId || user.sub;
    
    return this.cartOrderService.createOrder({
      userId: user.sub,
      cartId: cartId,
      shippingAddress: createOrderDto.shippingAddress,
      billingAddress: createOrderDto.billingAddress,
      notes: createOrderDto.notes,
    });
  }

  /**
   * ORDER MANAGEMENT
   * Endpoints for managing orders
   */
  // Legacy endpoint - retained for backward compatibility
  @Post("orders")
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @CurrentUser() user: JwtPayload,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.cartOrderService.createOrder({
      userId: user.sub,
      ...createOrderDto,
    });
  }

  @Get("orders")
  async getUserOrders(@CurrentUser() user: JwtPayload) {
    return this.cartOrderService.getOrdersByUserId(user.sub);
  }

  @Get("orders/:orderId")
  async getOrder(@Param("orderId") orderId: string) {
    return this.cartOrderService.getOrderById(orderId);
  }

  /**
   * Get detailed invoice data for an order
   * Supports both JSON and PDF formats based on query parameter
   * Usage:
   * - /api/cartorder/orders/:orderId/invoice - Returns JSON data
   * - /api/cartorder/orders/:orderId/invoice?format=pdf - Returns PDF file
   */
  @Get("orders/:orderId/invoice")
  async getOrderInvoice(
    @Param("orderId") orderId: string,
    @Query("format") format?: string,
    @Res({ passthrough: true }) res?: Response
  ) {
    // Get invoice data from the service
    const invoiceData = await this.cartOrderService.getOrderInvoice(orderId);
    
    // Process with the invoice service
    const enhancedInvoiceData = this.invoiceService.generateInvoiceData(invoiceData);
    
    // Return PDF if requested
    if (format === 'pdf') {
      const pdfBuffer = await this.invoiceService.generatePdf(enhancedInvoiceData);
      
      // Set appropriate headers for PDF download
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceData.invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      
      // Return the PDF as a streamable file
      return new StreamableFile(pdfBuffer);
    }
    
    // Default: return JSON data
    return enhancedInvoiceData;
  }

  @Put("orders/:orderId/status")
  async updateOrderStatus(
    @Param("orderId") orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.cartOrderService.updateOrderStatus({
      orderId,
      ...updateOrderStatusDto,
    });
  }

  @Delete("orders/:orderId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOrder(@Param("orderId") orderId: string) {
    return this.cartOrderService.deleteOrder(orderId);
  }

  /**
   * PAYMENT OPERATIONS
   * Endpoints for payment processing
   */
  @Post("payments")
  @HttpCode(HttpStatus.CREATED)
  async createPayment(
    @CurrentUser() user: JwtPayload,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.cartOrderService.createPayment({
      userId: user.sub,
      ...createPaymentDto,
    });
  }

  @Get("payments")
  async getUserPayments(@CurrentUser() user: JwtPayload) {
    return this.cartOrderService.getPaymentsByUserId(user.sub);
  }

  @Get("payments/:paymentId")
  async getPayment(@Param("paymentId") paymentId: string) {
    return this.cartOrderService.getPaymentById(paymentId);
  }

  @Get("orders/:orderId/payments")
  async getOrderPayments(@Param("orderId") orderId: string) {
    return this.cartOrderService.getPaymentsByOrderId(orderId);
  }

  @Post("payments/:paymentId/process")
  async processPayment(
    @Param("paymentId") paymentId: string,
    @Body() processPaymentDto: ProcessPaymentDto,
  ) {
    return this.cartOrderService.processPayment({
      paymentId,
      ...processPaymentDto,
    });
  }
}
