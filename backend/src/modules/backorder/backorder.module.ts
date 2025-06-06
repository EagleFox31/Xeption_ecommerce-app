/**
 * Module NestJS pour backorder
 * Configuration des providers et controllers
 */

import { Module } from "@nestjs/common";
import { BackorderController } from "./backorder.controller";
import { BackorderService } from "./backorder.service";

// Use cases
import { CreateBackorderRequestUseCase } from "../../application/backorder/create-backorder-request.use-case";
import { GetBackorderRequestUseCase } from "../../application/backorder/get-backorder-request.use-case";
import { GetUserBackorderRequestsUseCase } from "../../application/backorder/get-user-backorder-requests.use-case";
import { UpdateBackorderRequestUseCase } from "../../application/backorder/update-backorder-request.use-case";
import { CancelBackorderRequestUseCase } from "../../application/backorder/cancel-backorder-request.use-case";

// Repositories
import { BackorderRepository } from "../../domain/backorder/backorder.port";
import { SupabaseBackorderRepository } from "../../infrastructure/supabase/repositories/backorder.repository";

// Services externes (mocks pour l'instant)
import {
  ProductStockService,
  BackorderNotificationService,
} from "../../domain/backorder/backorder.port";

// Mock implementations (à remplacer par de vraies implémentations)
class MockProductStockService implements ProductStockService {
  async checkStockLevel(productId: string): Promise<number> {
    // Mock: retourne toujours 0 pour simuler un produit hors stock
    return 0;
  }

  async getExpectedRestockDate(productId: string): Promise<Date | null> {
    // Mock: retourne une date dans 2 semaines
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date;
  }

  async subscribeToStockUpdates(
    productId: string,
    callback: (stock: number) => void,
  ): Promise<void> {
    // Mock: ne fait rien pour l'instant
    console.log(`Subscribed to stock updates for product ${productId}`);
  }
}

class MockBackorderNotificationService implements BackorderNotificationService {
  async sendAvailabilityNotification(
    backorderRequest: any,
    productAvailability: any,
  ): Promise<void> {
    console.log(
      `Sending availability notification for request ${backorderRequest.id}`,
    );
  }

  async sendStatusUpdateNotification(backorderRequest: any): Promise<void> {
    console.log(
      `Sending status update notification for request ${backorderRequest.id}`,
    );
  }

  async sendPriceChangeNotification(
    backorderRequest: any,
    newPrice: number,
  ): Promise<void> {
    console.log(
      `Sending price change notification for request ${backorderRequest.id}`,
    );
  }
}

@Module({
  controllers: [BackorderController],
  providers: [
    BackorderService,

    // Use cases
    CreateBackorderRequestUseCase,
    GetBackorderRequestUseCase,
    GetUserBackorderRequestsUseCase,
    UpdateBackorderRequestUseCase,
    CancelBackorderRequestUseCase,

    // Repository
    {
      provide: BackorderRepository,
      useClass: SupabaseBackorderRepository,
    },

    // Services externes (mocks)
    {
      provide: ProductStockService,
      useClass: MockProductStockService,
    },
    {
      provide: BackorderNotificationService,
      useClass: MockBackorderNotificationService,
    },
  ],
  exports: [BackorderService],
})
export class BackorderModule {}
