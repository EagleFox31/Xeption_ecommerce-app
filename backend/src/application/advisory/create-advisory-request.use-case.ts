import { Injectable, BadRequestException, Inject } from "@nestjs/common";
import {
  AdvisoryRepositoryPort,
  CreateAdvisoryRequestData,
  ADVISORY_REPOSITORY
} from "../../domain/advisory/advisory.port";
import { AdvisoryRequest } from "../../domain/advisory/advisory.entity";

@Injectable()
export class CreateAdvisoryRequestUseCase {
  constructor(
    @Inject(ADVISORY_REPOSITORY)
    private readonly advisoryRepository: AdvisoryRepositoryPort
  ) {}

  async execute(data: CreateAdvisoryRequestData): Promise<AdvisoryRequest> {
    // Validate budget
    if (data.budget.min_amount < 0 || data.budget.max_amount < 0) {
      throw new BadRequestException("Budget amounts must be positive");
    }

    if (data.budget.min_amount > data.budget.max_amount) {
      throw new BadRequestException(
        "Minimum budget cannot be greater than maximum budget",
      );
    }

    // Validate deadline if provided
    if (data.deadline && data.deadline <= new Date()) {
      throw new BadRequestException("Deadline must be in the future");
    }

    // Validate required fields
    if (!data.title?.trim()) {
      throw new BadRequestException("Title is required");
    }

    if (!data.description?.trim()) {
      throw new BadRequestException("Description is required");
    }

    if (!data.user_id?.trim()) {
      throw new BadRequestException("User ID is required");
    }

    // Set default currency if not provided
    if (!data.budget.currency) {
      data.budget.currency = "XAF";
    }

    return this.advisoryRepository.create(data);
  }
}
