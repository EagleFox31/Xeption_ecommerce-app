import { Module } from "@nestjs/common";
import { MarketingController } from "./marketing.controller";
import { MarketingService } from "./marketing.service";

// Domain
import { MarketingBannerRepositoryPort } from "../../domain/marketing/banner.port";

// Application Use Cases
import { GetBannersUseCase } from "../../application/marketing/get-banners.use-case";
import { GetAllBannersUseCase } from "../../application/marketing/get-all-banners.use-case";
import { GetBannerUseCase } from "../../application/marketing/get-banner.use-case";
import { CreateBannerUseCase } from "../../application/marketing/create-banner.use-case";
import { UpdateBannerUseCase } from "../../application/marketing/update-banner.use-case";
import { ToggleBannerStatusUseCase } from "../../application/marketing/toggle-banner-status.use-case";
import { DeleteBannerUseCase } from "../../application/marketing/delete-banner.use-case";

// Infrastructure
import { PrismaMarketingBannerRepository } from "../../infrastructure/prisma/repositories/marketing-banner.repository";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";
import { MARKETING_BANNER_REPOSITORY } from "../../domain/marketing/banner.port";

/**
 * Marketing Module
 * Organizes marketing banner management components
 * Follows hexagonal architecture with clear separation of concerns
 */
@Module({
  imports: [PrismaModule],
  controllers: [MarketingController],
  providers: [
    // Service
    MarketingService,

    // Use Cases
    GetBannersUseCase,
    GetAllBannersUseCase,
    GetBannerUseCase,
    CreateBannerUseCase,
    UpdateBannerUseCase,
    ToggleBannerStatusUseCase,
    DeleteBannerUseCase,

    // Repository Implementation
    PrismaMarketingBannerRepository, // Register the concrete implementation
    {
      provide: MARKETING_BANNER_REPOSITORY,
      useFactory: (repository: PrismaMarketingBannerRepository): MarketingBannerRepositoryPort => {
        return repository;
      },
      inject: [PrismaMarketingBannerRepository],
    },
  ],
  exports: [MarketingService, MARKETING_BANNER_REPOSITORY],
})
export class MarketingModule {}
