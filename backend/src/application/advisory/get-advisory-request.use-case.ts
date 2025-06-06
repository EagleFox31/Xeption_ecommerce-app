import { Injectable, NotFoundException } from "@nestjs/common";
import { AdvisoryRepositoryPort } from "../../domain/advisory/advisory.port";
import { AdvisoryRequest } from "../../domain/advisory/advisory.entity";

@Injectable()
export class GetAdvisoryRequestUseCase {
  constructor(private readonly advisoryRepository: AdvisoryRepositoryPort) {}

  async execute(id: string): Promise<AdvisoryRequest> {
    if (!id?.trim()) {
      throw new NotFoundException("Advisory request ID is required");
    }

    const request = await this.advisoryRepository.findById(id);

    if (!request) {
      throw new NotFoundException(`Advisory request with ID ${id} not found`);
    }

    return request;
  }

  async executeByUserId(
    userId: string,
    requestId: string,
  ): Promise<AdvisoryRequest> {
    if (!userId?.trim()) {
      throw new NotFoundException("User ID is required");
    }

    if (!requestId?.trim()) {
      throw new NotFoundException("Advisory request ID is required");
    }

    const request = await this.advisoryRepository.findById(requestId);

    if (!request) {
      throw new NotFoundException(
        `Advisory request with ID ${requestId} not found`,
      );
    }

    if (request.user_id !== userId) {
      throw new NotFoundException(
        `Advisory request with ID ${requestId} not found for user ${userId}`,
      );
    }

    return request;
  }
}
