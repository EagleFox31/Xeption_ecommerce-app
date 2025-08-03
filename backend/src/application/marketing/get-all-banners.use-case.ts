import { Injectable, Inject } from "@nestjs/common";
import { MarketingBannerRepositoryPort, MARKETING_BANNER_REPOSITORY } from "../../domain/marketing/banner.port";
import { MarketingBanner } from "../../domain/marketing/banner.entity";

/**
 * Get All Banners Use Case
 * Retrieves all banners for admin management
 */
@Injectable()
export class GetAllBannersUseCase {
  constructor(
    @Inject(MARKETING_BANNER_REPOSITORY)
    private readonly bannerRepository: MarketingBannerRepositoryPort,
  ) {}

  /**
   * Execute: Get all banners for admin view
   * @returns All banners regardless of status
   */
  async execute(): Promise<MarketingBanner[]> {
    return await this.bannerRepository.getAllBanners();
  }
}
