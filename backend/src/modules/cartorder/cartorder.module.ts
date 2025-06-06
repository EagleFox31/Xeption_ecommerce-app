import { Module } from "@nestjs/common";
import { CartOrderController } from "./cartorder.controller";
import { CartOrderService } from "./cartorder.service";
import { CreateCartUseCase } from "../../application/cartorder/create-cart.use-case";
import { GetCartUseCase } from "../../application/cartorder/get-cart.use-case";
import { UpdateCartUseCase } from "../../application/cartorder/update-cart.use-case";
import { CreateOrderUseCase } from "../../application/cartorder/create-order.use-case";
import { GetOrderUseCase } from "../../application/cartorder/get-order.use-case";
import { UpdateOrderUseCase } from "../../application/cartorder/update-order.use-case";
import { ProcessPaymentUseCase } from "../../application/cartorder/process-payment.use-case";
import { SupabaseCartOrderRepository } from "../../infrastructure/supabase/repositories/cartorder.repository";
import { CART_ORDER_REPOSITORY } from "../../domain/cartorder/cartorder.port";

@Module({
  controllers: [CartOrderController],
  providers: [
    CartOrderService,
    // Use cases
    CreateCartUseCase,
    GetCartUseCase,
    UpdateCartUseCase,
    CreateOrderUseCase,
    GetOrderUseCase,
    UpdateOrderUseCase,
    ProcessPaymentUseCase,
    // Repository
    {
      provide: CART_ORDER_REPOSITORY,
      useClass: SupabaseCartOrderRepository,
    },
  ],
  exports: [CartOrderService],
})
export class CartOrderModule {}
