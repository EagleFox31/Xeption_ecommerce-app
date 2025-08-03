import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { MarketingBannerRepositoryPort, MARKETING_BANNER_REPOSITORY } from "../../domain/marketing/banner.port";
import { MarketingBanner } from "../../domain/marketing/banner.entity";

/**
 * Get Banner Use Case
 * Retrieves a specific banner by ID
 */
@Injectable()
export class GetBannerUseCase {
  constructor(
    @Inject(MARKETING_BANNER_REPOSITORY)
    private readonly bannerRepository: MarketingBannerRepositoryPort,
  ) {}

  /**
   * Execute: Get banner by ID
   * @param id Banner ID
   * @returns Banner entity
   * @throws NotFoundException if banner not found
   */
  async execute(id: string): Promise<MarketingBanner> {
    const banner = await this.bannerRepository.getBannerById(id);

    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }

    return banner;
  }
}
