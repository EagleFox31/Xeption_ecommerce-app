import { Injectable } from "@nestjs/common";
import { MarketingBannerRepositoryPort } from "../../domain/marketing/banner.port";
import { MarketingBanner } from "../../domain/marketing/banner.entity";

/**
 * Get All Banners Use Case
 * Retrieves all banners for admin management
 */
@Injectable()
export class GetAllBannersUseCase {
  constructor(
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
