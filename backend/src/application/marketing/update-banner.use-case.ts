import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { MarketingBannerRepositoryPort } from "../../domain/marketing/banner.port";
import { MarketingBanner } from "../../domain/marketing/banner.entity";

export interface UpdateBannerRequest {
  title_237?: string;
  description_237?: string;
  image_url?: string;
  cta_url?: string;
  category_id?: string;
  priority?: number;
  start_date?: Date;
  end_date?: Date;
  active?: boolean;
}

/**
 * Update Banner Use Case
 * Updates an existing marketing banner
 */
@Injectable()
export class UpdateBannerUseCase {
  constructor(
    private readonly bannerRepository: MarketingBannerRepositoryPort,
  ) {}

  /**
   * Execute: Update an existing banner
   * @param id Banner ID
   * @param request Update data
   * @returns Updated banner
   * @throws NotFoundException if banner not found
   * @throws BadRequestException if validation fails
   */
  async execute(
    id: string,
    request: UpdateBannerRequest,
  ): Promise<MarketingBanner> {
    // Check if banner exists
    const existingBanner = await this.bannerRepository.getBannerById(id);
    if (!existingBanner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }

    // Validate dates if provided
    if (request.start_date || request.end_date) {
      const startDate = request.start_date || existingBanner.start_date;
      const endDate = request.end_date || existingBanner.end_date;

      if (startDate >= endDate) {
        throw new BadRequestException("Start date must be before end date");
      }
    }

    // Validate priority if provided
    if (request.priority !== undefined && request.priority < 0) {
      throw new BadRequestException("Priority must be a positive number");
    }

    // Update banner
    const updates = {
      ...request,
      updated_at: new Date(),
    };

    return await this.bannerRepository.updateBanner(id, updates);
  }
}
