import { Injectable, NotFoundException } from "@nestjs/common";
import { MarketingBannerRepositoryPort } from "../../domain/marketing/banner.port";
import { MarketingBanner } from "../../domain/marketing/banner.entity";

/**
 * Toggle Banner Status Use Case
 * Activates or deactivates a banner
 */
@Injectable()
export class ToggleBannerStatusUseCase {
  constructor(
    private readonly bannerRepository: MarketingBannerRepositoryPort,
  ) {}

  /**
   * Execute: Toggle banner active status
   * @param id Banner ID
   * @param active New active status
   * @returns Updated banner
   * @throws NotFoundException if banner not found
   */
  async execute(id: string, active: boolean): Promise<MarketingBanner> {
    // Check if banner exists
    const existingBanner = await this.bannerRepository.getBannerById(id);
    if (!existingBanner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }

    return await this.bannerRepository.toggleBannerStatus(id, active);
  }
}
