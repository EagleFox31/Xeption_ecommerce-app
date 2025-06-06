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
} from "@nestjs/common";
import { AuthGuard } from "../../common/auth/auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { JwtPayload } from "../../common/auth/jwt.types";
import { CartOrderService } from "./cartorder.service";
import {
  CreateCartDto,
  AddCartItemDto,
  UpdateCartItemDto,
  RemoveCartItemDto,
} from "./dto/cart.dto";
import { CreateOrderDto, UpdateOrderStatusDto } from "./dto/order.dto";
import { CreatePaymentDto, ProcessPaymentDto } from "./dto/payment.dto";

@Controller("api/cartorder")
@UseGuards(AuthGuard)
export class CartOrderController {
  constructor(private readonly cartOrderService: CartOrderService) {}

  // Cart endpoints
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

  // Order endpoints
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

  // Payment endpoints
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
