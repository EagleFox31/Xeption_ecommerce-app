import { Module } from "@nestjs/common";
import { AdvisoryController } from "./advisory.controller";
import { AdvisoryService } from "./advisory.service";
import { CreateAdvisoryRequestUseCase } from "../../application/advisory/create-advisory-request.use-case";
import { GetAdvisoryRequestUseCase } from "../../application/advisory/get-advisory-request.use-case";
import { GetUserAdvisoryRequestsUseCase } from "../../application/advisory/get-user-advisory-requests.use-case";
import { GetAvailableProductsUseCase } from "../../application/advisory/get-available-products.use-case";
import { AdvisoryRepository } from "../../infrastructure/supabase/repositories/advisory.repository";
import { ProductRepository } from "../../infrastructure/supabase/repositories/product.repository";
import { AdvisoryRepositoryPort } from "../../domain/advisory/advisory.port";
import { ProductRepositoryPort } from "../../domain/catalog/product.port";

@Module({
  controllers: [AdvisoryController],
  providers: [
    AdvisoryService,
    CreateAdvisoryRequestUseCase,
    GetAdvisoryRequestUseCase,
    GetUserAdvisoryRequestsUseCase,
    GetAvailableProductsUseCase,
    {
      provide: AdvisoryRepositoryPort,
      useClass: AdvisoryRepository,
    },
    {
      provide: ProductRepositoryPort,
      useClass: ProductRepository,
    },
  ],
  exports: [AdvisoryService],
})
export class AdvisoryModule {}
