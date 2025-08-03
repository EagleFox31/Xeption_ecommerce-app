/**
 * Module NestJS pour delivery
 * Configuration des dépendances et injection
 */

import { Module } from "@nestjs/common";
import { DeliveryController } from "./delivery.controller";
import { DeliveryService } from "./delivery.service";
import { CalculateDeliveryFeeUseCase } from "../../application/delivery/calculate-delivery-fee.use-case";
import { GetAvailableZonesUseCase } from "../../application/delivery/get-available-zones.use-case";
import { PrismaDeliveryRepository } from "../../infrastructure/prisma/repositories/delivery.repository";
import { DELIVERY_REPOSITORY } from "../../domain/delivery/delivery.port";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [DeliveryController],
  providers: [
    DeliveryService,
    CalculateDeliveryFeeUseCase,
    GetAvailableZonesUseCase,
    {
      provide: DELIVERY_REPOSITORY,
      useClass: PrismaDeliveryRepository,
    },
  ],
  exports: [DeliveryService],
})
export class DeliveryModule {}
