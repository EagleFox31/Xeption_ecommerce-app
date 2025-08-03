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
  PRODUCT_STOCK_SERVICE,
  BACKORDER_NOTIFICATION_SERVICE,
} from "../../domain/backorder/backorder.port";
import { BackorderDomainService } from "../../domain/backorder/backorder-domain.service";
import { PrismaBackorderRepository } from "../../infrastructure/prisma/repositories/backorder.repository";
import { PrismaProductStockService } from "../../infrastructure/prisma/services/product-stock.service";
import { PrismaBackorderNotificationService } from "../../infrastructure/prisma/services/backorder-notification.service";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";

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

    BackorderDomainService,

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
