import { Module } from "@nestjs/common";
import { RFQController } from "./rfq.controller";
import { RFQService } from "./rfq.service";

// Use‑Cases
import { CreateRFQRequestUseCase } from "../../application/rfq/create-rfq-request.use-case";
import { GetRFQRequestUseCase } from "../../application/rfq/get-rfq-request.use-case";
import { GetUserRFQRequestsUseCase } from "../../application/rfq/get-user-rfq-requests.use-case";
import { UpdateRFQRequestUseCase } from "../../application/rfq/update-rfq-request.use-case";
import { GetAllRFQsUseCase } from "../../application/rfq/get-all-rfqs.use-case";
import { CreateRFQResponseUseCase } from "../../application/rfq/create-rfq-response.use-case";

// Infrastructure adapter (Prisma)
import { PrismaRFQRepository } from "../../infrastructure/prisma/repositories/rfq.repository";

// Domain port token — doit être exporté dans rfq.port.ts
import { RFQ_REPOSITORY, RFQRepository } from "../../domain/rfq/rfq.port";

@Module({
  controllers: [RFQController],
  providers: [
    RFQService,

    // Use‑Cases
    CreateRFQRequestUseCase,
    GetRFQRequestUseCase,
    GetUserRFQRequestsUseCase,
    UpdateRFQRequestUseCase,
    GetAllRFQsUseCase,
    CreateRFQResponseUseCase,

    // Repository binding with explicit factory provider
    PrismaRFQRepository, // Register the concrete implementation
    {
      provide: RFQ_REPOSITORY,
      useFactory: (prismaRfqRepo: PrismaRFQRepository): RFQRepository => {
        return prismaRfqRepo;
      },
      inject: [PrismaRFQRepository]
    },
  ],
  exports: [RFQService],
})
export class RFQModule {}
