import { MarketingBanner } from "./banner.entity";

/**
 * Marketing Banner Repository Port
 * Defines the contract for banner data access
 */
export interface MarketingBannerRepositoryPort {
  /**
   * Get all active banners, optionally filtered by category
   */
  getActiveBanners(categoryId?: string): Promise<MarketingBanner[]>;

  /**
   * Get all banners (admin view)
   */
  getAllBanners(): Promise<MarketingBanner[]>;

  /**
   * Get banner by ID
   */
  getBannerById(id: string): Promise<MarketingBanner | null>;

  /**
   * Create a new banner
   */
  createBanner(
    banner: Omit<MarketingBanner, "id" | "created_at" | "updated_at">,
  ): Promise<MarketingBanner>;

  /**
   * Update an existing banner
   */
  updateBanner(
    id: string,
    updates: Partial<MarketingBanner>,
  ): Promise<MarketingBanner>;

  /**
   * Toggle banner active status
   */
  toggleBannerStatus(id: string, active: boolean): Promise<MarketingBanner>;

  /**
   * Delete a banner
   */
  deleteBanner(id: string): Promise<void>;

  /**
   * Get banners by priority (for ordering)
   */
  getBannersByPriority(categoryId?: string): Promise<MarketingBanner[]>;
}
