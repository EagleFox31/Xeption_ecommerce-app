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

// Repositories and Services
import {
  BACKORDER_REPOSITORY,
  ProductStockService,
  BackorderNotificationService,
} from "../../domain/backorder/backorder.port";
import { PrismaBackorderRepository } from "../../infrastructure/prisma/repositories/backorder.repository";
import { PrismaProductStockService } from "../../infrastructure/prisma/services/product-stock.service";
import { PrismaBackorderNotificationService } from "../../infrastructure/prisma/services/backorder-notification.service";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";

/**
 * Injection token for ProductStockService
 */
export const PRODUCT_STOCK_SERVICE = 'PRODUCT_STOCK_SERVICE';

/**
 * Injection token for BackorderNotificationService
 */
export const BACKORDER_NOTIFICATION_SERVICE = 'BACKORDER_NOTIFICATION_SERVICE';

@Module({
  imports: [PrismaModule],
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
      provide: BACKORDER_REPOSITORY,
      useClass: PrismaBackorderRepository,
    },

    // Services externes (Prisma implementations)
    {
      provide: PRODUCT_STOCK_SERVICE,
      useClass: PrismaProductStockService,
    },
    {
      provide: BACKORDER_NOTIFICATION_SERVICE,
      useClass: PrismaBackorderNotificationService,
    },
  ],
  exports: [BackorderService],
})
export class BackorderModule {}
