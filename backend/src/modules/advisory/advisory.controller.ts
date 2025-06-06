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

@Controller("advisory")
@UseGuards(AuthGuard)
export class AdvisoryController {
  constructor(private readonly advisoryService: AdvisoryService) {}

  /**
   * Create a new advisory request
   */
  @Post()
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
  @Get("my-requests")
  async getMyAdvisoryRequests(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AdvisoryRequestQueryDto,
  ): Promise<AdvisoryRequestListResponseDto> {
    return this.advisoryService.getUserAdvisoryRequests(user.id, query);
  }

  /**
   * Get current user's pending advisory requests
   */
  @Get("my-requests/pending")
  async getMyPendingRequests(
    @CurrentUser() user: AuthenticatedUser,
    @Query("limit") limit?: number,
  ): Promise<AdvisoryRequestListResponseDto> {
    return this.advisoryService.getUserPendingRequests(user.id, limit);
  }

  /**
   * Get current user's completed advisory requests
   */
  @Get("my-requests/completed")
  async getMyCompletedRequests(
    @CurrentUser() user: AuthenticatedUser,
    @Query("limit") limit?: number,
  ): Promise<AdvisoryRequestListResponseDto> {
    return this.advisoryService.getUserCompletedRequests(user.id, limit);
  }

  /**
   * Get product recommendations based on budget and preferences
   */
  @Post("recommendations")
  async getProductRecommendations(
    @Body() recommendationsDto: GetProductRecommendationsDto,
  ) {
    return this.advisoryService.getProductRecommendations(
      recommendationsDto.budget,
      recommendationsDto.preferences,
      recommendationsDto.limit,
    );
  }

  /**
   * Get a specific advisory request by ID
   */
  @Get(":id")
  async getAdvisoryRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ): Promise<AdvisoryRequestResponseDto> {
    return this.advisoryService.getAdvisoryRequest(user.id, id);
  }

  /**
   * Update an advisory request
   */
  @Put(":id")
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
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAdvisoryRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ): Promise<void> {
    return this.advisoryService.deleteAdvisoryRequest(user.id, id);
  }
}
