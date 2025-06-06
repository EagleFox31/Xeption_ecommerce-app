import { Injectable, NotFoundException } from "@nestjs/common";
import { MarketingBannerRepositoryPort } from "../../domain/marketing/banner.port";

/**
 * Delete Banner Use Case
 * Removes a banner from the system
 */
@Injectable()
export class DeleteBannerUseCase {
  constructor(
    private readonly bannerRepository: MarketingBannerRepositoryPort,
  ) {}

  /**
   * Execute: Delete a banner
   * @param id Banner ID
   * @throws NotFoundException if banner not found
   */
  async execute(id: string): Promise<void> {
    // Check if banner exists
    const existingBanner = await this.bannerRepository.getBannerById(id);
    if (!existingBanner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }

    await this.bannerRepository.deleteBanner(id);
  }
}
