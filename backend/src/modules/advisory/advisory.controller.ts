import {
  Controller,
  Get,
  Post,
  Put,
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
import { AdvisoryService } from "./advisory.service";
import {
  CreateAdvisoryRequestDto,
  UpdateAdvisoryRequestDto,
  AdvisoryRequestQueryDto,
  GetProductRecommendationsDto,
  AdvisoryRequestResponseDto,
  AdvisoryRequestListResponseDto,
} from "./dto/advisory.dto";
import { UpdateAdvisoryRequestStatusDto } from "./dto/status-update.dto";

/**
 * Advisory API Controller
 *
 * Endpoints are organized by resource type:
 * 1. Request operations (/advisory/requests/*)
 * 2. Recommendation operations (/advisory/recommendations/*)
 */
@Controller("advisory")
@UseGuards(AuthGuard)
export class AdvisoryController {
  constructor(private readonly advisoryService: AdvisoryService) {}

  /**
   * REQUEST OPERATIONS
   * Endpoints pour la gestion des demandes de conseil
   */

  /**
   * Create a new advisory request
   */
  @Post("requests")
  @HttpCode(HttpStatus.CREATED)
  async createAdvisoryRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createDto: CreateAdvisoryRequestDto,
  ): Promise<AdvisoryRequestResponseDto> {
    return this.advisoryService.createAdvisoryRequest(user.id, createDto);
  }

  /**
   * Get current user's advisory requests
   */
  @Get("requests/my")
  async getMyAdvisoryRequests(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AdvisoryRequestQueryDto,
  ): Promise<AdvisoryRequestListResponseDto> {
    return this.advisoryService.getUserAdvisoryRequests(user.id, query);
  }

  /**
   * Get current user's pending advisory requests
   */
  @Get("requests/my/pending")
  async getMyPendingRequests(
    @CurrentUser() user: AuthenticatedUser,
    @Query("limit") limit?: number,
  ): Promise<AdvisoryRequestListResponseDto> {
    return this.advisoryService.getUserPendingRequests(user.id, limit);
  }

  /**
   * Get current user's completed advisory requests
   */
  @Get("requests/my/completed")
  async getMyCompletedRequests(
    @CurrentUser() user: AuthenticatedUser,
    @Query("limit") limit?: number,
  ): Promise<AdvisoryRequestListResponseDto> {
    return this.advisoryService.getUserCompletedRequests(user.id, limit);
  }

  /**
   * RECOMMENDATION OPERATIONS
   * Endpoints pour obtenir des recommandations produits
   */

  /**
   * Get product recommendations based on budget and preferences
   */
  @Post("recommendations")
  async getProductRecommendations(
    @Body() recommendationsDto: GetProductRecommendationsDto,
  ) {
    // Ensure budget is compatible with domain entity
    const budget = {
      ...recommendationsDto.budget,
      is_flexible: recommendationsDto.budget.is_flexible || false // Default to false if not provided
    };
    
    return this.advisoryService.getProductRecommendations(
      budget,
      recommendationsDto.preferences,
      recommendationsDto.limit,
    );
  }

  /**
   * Get a specific advisory request by ID
   */
  @Get("requests/:id")
  async getAdvisoryRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ): Promise<AdvisoryRequestResponseDto> {
    return this.advisoryService.getAdvisoryRequest(user.id, id);
  }

  /**
   * Update an advisory request
   */
  @Put("requests/:id")
  async updateAdvisoryRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() updateDto: UpdateAdvisoryRequestDto,
  ): Promise<AdvisoryRequestResponseDto> {
    return this.advisoryService.updateAdvisoryRequest(user.id, id, updateDto);
  }

  /**
   * Delete an advisory request
   */
  @Delete("requests/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAdvisoryRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ): Promise<void> {
    return this.advisoryService.deleteAdvisoryRequest(user.id, id);
  }

  /**
   * Update advisory request status only
   * This endpoint allows explicit status updates for specific business workflows
   */
  @Put("requests/:id/status")
  async updateAdvisoryRequestStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() statusUpdate: UpdateAdvisoryRequestStatusDto,
  ): Promise<AdvisoryRequestResponseDto> {
    // Create a DTO with only status field
    const updateDto: UpdateAdvisoryRequestDto = {
      status: statusUpdate.status
    };
    
    return this.advisoryService.updateAdvisoryRequest(user.id, id, updateDto);
  }
}
