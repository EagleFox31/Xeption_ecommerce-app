import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { MarketingBannerRepositoryPort, MARKETING_BANNER_REPOSITORY } from "../../domain/marketing/banner.port";

/**
 * Delete Banner Use Case
 * Removes a banner from the system
 */
@Injectable()
export class DeleteBannerUseCase {
  constructor(
    @Inject(MARKETING_BANNER_REPOSITORY)
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
