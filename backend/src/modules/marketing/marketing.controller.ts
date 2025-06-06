import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { AuthGuard } from "../../common/auth/auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { AuthenticatedUser } from "../../common/auth/jwt.types";
import { MarketingService } from "./marketing.service";
import {
  CreateMarketingBannerDto,
  UpdateMarketingBannerDto,
  ToggleBannerStatusDto,
  MarketingBannerResponseDto,
} from "./dto/marketing.dto";
import { MarketingBanner } from "../../domain/marketing/banner.entity";

/**
 * Marketing Controller
 * Handles HTTP requests for marketing banner management
 * REST contract-first design, OpenAPI ready
 */
@Controller("marketing")
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  /**
   * PUBLIC ENDPOINTS - No authentication required
   */

  /**
   * Get active banners for public display
   * GET /marketing/banners
   * GET /marketing/banners?category=electronics
   */
  @Get("banners")
  @HttpCode(HttpStatus.OK)
  async getActiveBanners(
    @Query("category") categoryId?: string,
  ): Promise<MarketingBannerResponseDto[]> {
    const banners = await this.marketingService.getActiveBanners(categoryId);
    return banners.map(this.mapToResponseDto);
  }

  /**
   * ADMIN ENDPOINTS - Authentication required
   */

  /**
   * Get all banners for admin management
   * GET /marketing/admin/banners
   */
  @Get("admin/banners")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getAllBanners(): Promise<MarketingBannerResponseDto[]> {
    const banners = await this.marketingService.getAllBanners();
    return banners.map(this.mapToResponseDto);
  }

  /**
   * Get banner by ID
   * GET /marketing/admin/banners/:id
   */
  @Get("admin/banners/:id")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getBannerById(
    @Param("id") id: string,
  ): Promise<MarketingBannerResponseDto> {
    const banner = await this.marketingService.getBannerById(id);
    return this.mapToResponseDto(banner);
  }

  /**
   * Create a new banner
   * POST /marketing/admin/banners
   */
  @Post("admin/banners")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createBanner(
    @Body() createBannerDto: CreateMarketingBannerDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MarketingBannerResponseDto> {
    const bannerRequest = {
      ...createBannerDto,
      start_date: new Date(createBannerDto.start_date),
      end_date: new Date(createBannerDto.end_date),
      created_by: user.id,
    };

    const banner = await this.marketingService.createBanner(bannerRequest);
    return this.mapToResponseDto(banner);
  }

  /**
   * Update an existing banner
   * PUT /marketing/admin/banners/:id
   */
  @Put("admin/banners/:id")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateBanner(
    @Param("id") id: string,
    @Body() updateBannerDto: UpdateMarketingBannerDto,
  ): Promise<MarketingBannerResponseDto> {
    const updateRequest = {
      ...updateBannerDto,
      start_date: updateBannerDto.start_date
        ? new Date(updateBannerDto.start_date)
        : undefined,
      end_date: updateBannerDto.end_date
        ? new Date(updateBannerDto.end_date)
        : undefined,
    };

    const banner = await this.marketingService.updateBanner(id, updateRequest);
    return this.mapToResponseDto(banner);
  }

  /**
   * Toggle banner active status
   * PATCH /marketing/admin/banners/:id/status
   */
  @Patch("admin/banners/:id/status")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async toggleBannerStatus(
    @Param("id") id: string,
    @Body() toggleStatusDto: ToggleBannerStatusDto,
  ): Promise<MarketingBannerResponseDto> {
    const banner = await this.marketingService.toggleBannerStatus(
      id,
      toggleStatusDto.active,
    );
    return this.mapToResponseDto(banner);
  }

  /**
   * Delete a banner
   * DELETE /marketing/admin/banners/:id
   */
  @Delete("admin/banners/:id")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBanner(@Param("id") id: string): Promise<void> {
    await this.marketingService.deleteBanner(id);
  }

  /**
   * Helper method to map entity to response DTO
   */
  private mapToResponseDto(
    banner: MarketingBanner,
  ): MarketingBannerResponseDto {
    return {
      id: banner.id,
      title_237: banner.title_237,
      description_237: banner.description_237,
      image_url: banner.image_url,
      cta_url: banner.cta_url,
      category_id: banner.category_id,
      priority: banner.priority,
      start_date: banner.start_date.toISOString(),
      end_date: banner.end_date.toISOString(),
      active: banner.active,
      created_at: banner.created_at.toISOString(),
      updated_at: banner.updated_at.toISOString(),
      created_by: banner.created_by,
    };
  }
}
