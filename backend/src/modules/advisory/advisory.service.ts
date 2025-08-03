import { Injectable, Inject } from "@nestjs/common";
import { CreateAdvisoryRequestUseCase } from "../../application/advisory/create-advisory-request.use-case";
import { GetAdvisoryRequestUseCase } from "../../application/advisory/get-advisory-request.use-case";
import { GetUserAdvisoryRequestsUseCase } from "../../application/advisory/get-user-advisory-requests.use-case";
import { GetAvailableProductsUseCase } from "../../application/advisory/get-available-products.use-case";
import {
  CreateAdvisoryRequestDto,
  UpdateAdvisoryRequestDto,
  AdvisoryRequestQueryDto,
  AdvisoryRequestResponseDto,
  AdvisoryRequestListResponseDto,
} from "./dto/advisory.dto";
import {
  AdvisoryBudget,
  AdvisoryPreferences,
  AdvisoryRequest,
} from "../../domain/advisory/advisory.entity";
import {
  AdvisoryRepositoryPort,
  AdvisoryRequestListOptions,
  UpdateAdvisoryRequestData,
  ADVISORY_REPOSITORY
} from "../../domain/advisory/advisory.port";

@Injectable()
export class AdvisoryService {
  constructor(
    private readonly createAdvisoryRequestUseCase: CreateAdvisoryRequestUseCase,
    private readonly getAdvisoryRequestUseCase: GetAdvisoryRequestUseCase,
    private readonly getUserAdvisoryRequestsUseCase: GetUserAdvisoryRequestsUseCase,
    private readonly getAvailableProductsUseCase: GetAvailableProductsUseCase,
    @Inject(ADVISORY_REPOSITORY)
    private readonly advisoryRepository: AdvisoryRepositoryPort,
  ) {}

  async createAdvisoryRequest(
    userId: string,
    createDto: CreateAdvisoryRequestDto,
  ): Promise<AdvisoryRequestResponseDto> {
    const request = await this.createAdvisoryRequestUseCase.execute({
      user_id: userId,
      title: createDto.title,
      description: createDto.description,
      budget: createDto.budget,
      preferences: createDto.preferences,
      deadline: createDto.deadline ? new Date(createDto.deadline) : undefined,
    });

    return this.mapToResponseDto(request);
  }

  async getAdvisoryRequest(
    userId: string,
    requestId: string,
  ): Promise<AdvisoryRequestResponseDto> {
    const request = await this.getAdvisoryRequestUseCase.executeByUserId(
      userId,
      requestId,
    );
    return this.mapToResponseDto(request);
  }

  async getUserAdvisoryRequests(
    userId: string,
    query: AdvisoryRequestQueryDto,
  ): Promise<AdvisoryRequestListResponseDto> {
    const options: AdvisoryRequestListOptions = {
      filters: {
        status: query.status,
        min_budget: query.min_budget,
        max_budget: query.max_budget,
        has_response: query.has_response,
        is_overdue: query.is_overdue,
      },
      sort_by: query.sort_by,
      sort_order: query.sort_order,
      page: query.page,
      limit: query.limit,
    };

    const result = await this.getUserAdvisoryRequestsUseCase.execute(
      userId,
      options,
    );

    return {
      requests: result.requests.map((request) =>
        this.mapToResponseDto(request),
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
      total_pages: result.total_pages,
    };
  }

  async getUserPendingRequests(
    userId: string,
    limit?: number,
  ): Promise<AdvisoryRequestListResponseDto> {
    const result = await this.getUserAdvisoryRequestsUseCase.getPendingRequests(
      userId,
      limit,
    );

    return {
      requests: result.requests.map((request) =>
        this.mapToResponseDto(request),
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
      total_pages: result.total_pages,
    };
  }

  async getUserCompletedRequests(
    userId: string,
    limit?: number,
  ): Promise<AdvisoryRequestListResponseDto> {
    const result =
      await this.getUserAdvisoryRequestsUseCase.getCompletedRequests(
        userId,
        limit,
      );

    return {
      requests: result.requests.map((request) =>
        this.mapToResponseDto(request),
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
      total_pages: result.total_pages,
    };
  }

  async updateAdvisoryRequest(
    userId: string,
    requestId: string,
    updateDto: UpdateAdvisoryRequestDto,
  ): Promise<AdvisoryRequestResponseDto> {
    // First verify the request belongs to the user
    await this.getAdvisoryRequestUseCase.executeByUserId(userId, requestId);

    const updateData: UpdateAdvisoryRequestData = {
      title: updateDto.title,
      description: updateDto.description,
      budget: updateDto.budget,
      preferences: updateDto.preferences,
      status: updateDto.status,
      deadline: updateDto.deadline ? new Date(updateDto.deadline) : undefined,
    };

    const updatedRequest = await this.advisoryRepository.update(
      requestId,
      updateData,
    );
    return this.mapToResponseDto(updatedRequest);
  }

  async deleteAdvisoryRequest(
    userId: string,
    requestId: string,
  ): Promise<void> {
    // First verify the request belongs to the user
    await this.getAdvisoryRequestUseCase.executeByUserId(userId, requestId);

    await this.advisoryRepository.delete(requestId);
  }

  async getProductRecommendations(
    budget: AdvisoryBudget,
    preferences?: AdvisoryPreferences,
    limit?: number,
  ) {
    return this.getAvailableProductsUseCase.execute(budget, preferences, limit);
  }

  private mapToResponseDto(
    request: AdvisoryRequest,
  ): AdvisoryRequestResponseDto {
    return {
      id: request.id,
      user_id: request.user_id,
      title: request.title,
      description: request.description,
      budget: request.budget as any,
      preferences: request.preferences as any,
      status: request.status,
      priority: request.priority,
      response: request.response,
      created_at: request.created_at,
      updated_at: request.updated_at,
      deadline: request.deadline,
    };
  }
}
