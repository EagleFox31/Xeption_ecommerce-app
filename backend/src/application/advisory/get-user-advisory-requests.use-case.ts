import { Injectable, BadRequestException, Inject } from "@nestjs/common";
import {
  AdvisoryRepositoryPort,
  AdvisoryRequestListOptions,
  AdvisoryRequestListResult,
  ADVISORY_REPOSITORY
} from "../../domain/advisory/advisory.port";

@Injectable()
export class GetUserAdvisoryRequestsUseCase {
  constructor(
    @Inject(ADVISORY_REPOSITORY)
    private readonly advisoryRepository: AdvisoryRepositoryPort
  ) {}

  async execute(
    userId: string,
    options?: AdvisoryRequestListOptions,
  ): Promise<AdvisoryRequestListResult> {
    if (!userId?.trim()) {
      throw new BadRequestException("User ID is required");
    }

    // Validate pagination parameters
    if (options?.page && options.page < 1) {
      throw new BadRequestException("Page must be greater than 0");
    }

    if (options?.limit && (options.limit < 1 || options.limit > 100)) {
      throw new BadRequestException("Limit must be between 1 and 100");
    }

    // Set default options
    const defaultOptions: AdvisoryRequestListOptions = {
      sort_by: "created_at",
      sort_order: "desc",
      page: 1,
      limit: 20,
      ...options,
    };

    return this.advisoryRepository.findByUserId(userId, defaultOptions);
  }

  async getPendingRequests(
    userId: string,
    limit?: number,
  ): Promise<AdvisoryRequestListResult> {
    if (!userId?.trim()) {
      throw new BadRequestException("User ID is required");
    }

    const options: AdvisoryRequestListOptions = {
      filters: {
        user_id: userId,
        status: "pending" as any,
      },
      sort_by: "created_at",
      sort_order: "desc",
      page: 1,
      limit: limit || 10,
    };

    return this.advisoryRepository.findByUserId(userId, options);
  }

  async getCompletedRequests(
    userId: string,
    limit?: number,
  ): Promise<AdvisoryRequestListResult> {
    if (!userId?.trim()) {
      throw new BadRequestException("User ID is required");
    }

    const options: AdvisoryRequestListOptions = {
      filters: {
        user_id: userId,
        status: "completed" as any,
      },
      sort_by: "updated_at",
      sort_order: "desc",
      page: 1,
      limit: limit || 10,
    };

    return this.advisoryRepository.findByUserId(userId, options);
  }
}
