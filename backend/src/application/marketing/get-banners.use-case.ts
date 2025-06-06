import { Injectable } from "@nestjs/common";
import { MarketingBannerRepositoryPort } from "../../domain/marketing/banner.port";
import { MarketingBanner } from "../../domain/marketing/banner.entity";

/**
 * Get Active Banners Use Case
 * Retrieves banners for public display, filtered and ordered
 */
@Injectable()
export class GetBannersUseCase {
  constructor(
    private readonly bannerRepository: MarketingBannerRepositoryPort,
  ) {}

  /**
   * Execute: Get active banners for public display
   * @param categoryId Optional category filter
   * @returns Active banners ordered by priority
   */
  async execute(categoryId?: string): Promise<MarketingBanner[]> {
    const banners =
      await this.bannerRepository.getBannersByPriority(categoryId);

    // Filter only currently active banners
    return banners.filter((banner) => banner.isCurrentlyActive());
  }
}
