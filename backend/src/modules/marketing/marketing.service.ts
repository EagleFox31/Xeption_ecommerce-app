import { Injectable } from "@nestjs/common";
import { GetBannersUseCase } from "../../application/marketing/get-banners.use-case";
import { GetAllBannersUseCase } from "../../application/marketing/get-all-banners.use-case";
import { GetBannerUseCase } from "../../application/marketing/get-banner.use-case";
import {
  CreateBannerUseCase,
  CreateBannerRequest,
} from "../../application/marketing/create-banner.use-case";
import {
  UpdateBannerUseCase,
  UpdateBannerRequest,
} from "../../application/marketing/update-banner.use-case";
import { ToggleBannerStatusUseCase } from "../../application/marketing/toggle-banner-status.use-case";
import { DeleteBannerUseCase } from "../../application/marketing/delete-banner.use-case";
import { MarketingBanner } from "../../domain/marketing/banner.entity";

/**
 * Marketing Service
 * Orchestrates marketing banner use cases
 */
@Injectable()
export class MarketingService {
  constructor(
    private readonly getBannersUseCase: GetBannersUseCase,
    private readonly getAllBannersUseCase: GetAllBannersUseCase,
    private readonly getBannerUseCase: GetBannerUseCase,
    private readonly createBannerUseCase: CreateBannerUseCase,
    private readonly updateBannerUseCase: UpdateBannerUseCase,
    private readonly toggleBannerStatusUseCase: ToggleBannerStatusUseCase,
    private readonly deleteBannerUseCase: DeleteBannerUseCase,
  ) {}

  /**
   * Get active banners for public display
   */
  async getActiveBanners(categoryId?: string): Promise<MarketingBanner[]> {
    return await this.getBannersUseCase.execute(categoryId);
  }

  /**
   * Get all banners for admin management
   */
  async getAllBanners(): Promise<MarketingBanner[]> {
    return await this.getAllBannersUseCase.execute();
  }

  /**
   * Get banner by ID
   */
  async getBannerById(id: string): Promise<MarketingBanner> {
    return await this.getBannerUseCase.execute(id);
  }

  /**
   * Create a new banner
   */
  async createBanner(request: CreateBannerRequest): Promise<MarketingBanner> {
    return await this.createBannerUseCase.execute(request);
  }

  /**
   * Update an existing banner
   */
  async updateBanner(
    id: string,
    request: UpdateBannerRequest,
  ): Promise<MarketingBanner> {
    return await this.updateBannerUseCase.execute(id, request);
  }

  /**
   * Toggle banner active status
   */
  async toggleBannerStatus(
    id: string,
    active: boolean,
  ): Promise<MarketingBanner> {
    return await this.toggleBannerStatusUseCase.execute(id, active);
  }

  /**
   * Delete a banner
   */
  async deleteBanner(id: string): Promise<void> {
    return await this.deleteBannerUseCase.execute(id);
  }
}
