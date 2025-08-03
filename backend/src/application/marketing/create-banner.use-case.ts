import { Injectable, BadRequestException, Inject } from "@nestjs/common";
import { MarketingBannerRepositoryPort, MARKETING_BANNER_REPOSITORY } from "../../domain/marketing/banner.port";
import { MarketingBanner } from "../../domain/marketing/banner.entity";

export interface CreateBannerRequest {
  title_237: string;
  description_237?: string;
  image_url: string;
  cta_url?: string;
  category_id?: string;
  priority: number;
  start_date: Date;
  end_date: Date;
  active: boolean;
  created_by: string;
}

/**
 * Create Banner Use Case
 * Creates a new marketing banner
 */
@Injectable()
export class CreateBannerUseCase {
  constructor(
    @Inject(MARKETING_BANNER_REPOSITORY)
    private readonly bannerRepository: MarketingBannerRepositoryPort,
  ) {}

  /**
   * Execute: Create a new banner
   * @param request Banner creation data
   * @returns Created banner
   * @throws BadRequestException if validation fails
   */
  async execute(request: CreateBannerRequest): Promise<MarketingBanner> {
    // Validate dates
    if (request.start_date >= request.end_date) {
      throw new BadRequestException("Start date must be before end date");
    }

    // Validate priority
    if (request.priority < 0) {
      throw new BadRequestException("Priority must be a positive number");
    }

    // Create banner data with timestamps
    const bannerData = {
      ...request,
      created_at: new Date(),
      updated_at: new Date()
    };

    return await this.bannerRepository.createBanner(bannerData);
  }
}
