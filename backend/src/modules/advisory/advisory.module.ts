import { Module } from "@nestjs/common";
import { AdvisoryController } from "./advisory.controller";
import { AdvisoryService } from "./advisory.service";
import { CreateAdvisoryRequestUseCase } from "../../application/advisory/create-advisory-request.use-case";
import { GetAdvisoryRequestUseCase } from "../../application/advisory/get-advisory-request.use-case";
import { GetUserAdvisoryRequestsUseCase } from "../../application/advisory/get-user-advisory-requests.use-case";
import { GetAvailableProductsUseCase } from "../../application/advisory/get-available-products.use-case";
import { ADVISORY_REPOSITORY } from "../../domain/advisory/advisory.port";
import { PRODUCT_REPOSITORY } from "../../domain/catalog/product.port";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";
import { PrismaAdvisoryRepository } from "../../infrastructure/prisma/repositories/advisory.repository";
import { PrismaProductRepository } from "../../infrastructure/prisma/repositories/product.repository";
import { AdvisoryRepositoryPort } from "../../domain/advisory/advisory.port";

@Module({
  imports: [PrismaModule],
  controllers: [AdvisoryController],
  providers: [
    AdvisoryService,
    CreateAdvisoryRequestUseCase,
    GetAdvisoryRequestUseCase,
    GetUserAdvisoryRequestsUseCase,
    GetAvailableProductsUseCase,
    // Explicit factory provider to ensure proper typing
    {
      provide: ADVISORY_REPOSITORY,
      useFactory: (prismaAdvisoryRepo: PrismaAdvisoryRepository): AdvisoryRepositoryPort => {
        return prismaAdvisoryRepo;
      },
      inject: [PrismaAdvisoryRepository]
    },
    // Register the implementation class separately
    PrismaAdvisoryRepository,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository, // Using Prisma implementation
    },
  ],
  exports: [AdvisoryService],
})
export class AdvisoryModule {}
