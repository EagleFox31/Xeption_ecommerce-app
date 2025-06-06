/**
 * Module NestJS pour delivery
 * Configuration des dépendances et injection
 */

import { Module } from "@nestjs/common";
import { DeliveryController } from "./delivery.controller";
import { DeliveryService } from "./delivery.service";
import { CalculateDeliveryFeeUseCase } from "../../application/delivery/calculate-delivery-fee.use-case";
import { GetAvailableZonesUseCase } from "../../application/delivery/get-available-zones.use-case";
import { DeliveryRepository } from "../../infrastructure/supabase/repositories/delivery.repository";
import { DeliveryRepositoryPort } from "../../domain/delivery/delivery.port";

@Module({
  controllers: [DeliveryController],
  providers: [
    DeliveryService,
    CalculateDeliveryFeeUseCase,
    GetAvailableZonesUseCase,
    {
      provide: DeliveryRepositoryPort,
      useClass: DeliveryRepository,
    },
  ],
  exports: [DeliveryService],
})
export class DeliveryModule {}
