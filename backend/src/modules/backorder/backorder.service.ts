/**
 * Service pour le module backorder
 * Orchestre les use cases et transforme les données
 */

import { Injectable } from "@nestjs/common";
import { CreateBackorderRequestUseCase } from "../../application/backorder/create-backorder-request.use-case";
import { GetBackorderRequestUseCase } from "../../application/backorder/get-backorder-request.use-case";
import { GetUserBackorderRequestsUseCase } from "../../application/backorder/get-user-backorder-requests.use-case";
import { UpdateBackorderRequestUseCase } from "../../application/backorder/update-backorder-request.use-case";
import { CancelBackorderRequestUseCase } from "../../application/backorder/cancel-backorder-request.use-case";
import { BackorderRepository } from "../../domain/backorder/backorder.port";
import {
  CreateBackorderRequestDto,
  UpdateBackorderRequestDto,
  CancelBackorderRequestDto,
  BackorderRequestFiltersDto,
  BackorderRequestResponseDto,
  BackorderRequestListResponseDto,
} from "./dto/backorder.dto";
import { BackorderRequest } from "../../domain/backorder/backorder.entity";

@Injectable()
export class BackorderService {
  constructor(
    private readonly createBackorderRequestUseCase: CreateBackorderRequestUseCase,
    private readonly getBackorderRequestUseCase: GetBackorderRequestUseCase,
    private readonly getUserBackorderRequestsUseCase: GetUserBackorderRequestsUseCase,
    private readonly updateBackorderRequestUseCase: UpdateBackorderRequestUseCase,
    private readonly cancelBackorderRequestUseCase: CancelBackorderRequestUseCase,
    private readonly backorderRepository: BackorderRepository,
  ) {}

  async createBackorderRequest(
    userId: string,
    createDto: CreateBackorderRequestDto,
  ): Promise<BackorderRequestResponseDto> {
    const backorderRequest = await this.createBackorderRequestUseCase.execute({
      userId,
      ...createDto,
    });

    return this.mapToResponseDto(backorderRequest);
  }

  async getBackorderRequest(
    requestId: string,
    userId: string,
  ): Promise<BackorderRequestResponseDto> {
    const backorderRequest = await this.getBackorderRequestUseCase.execute({
      requestId,
      userId,
    });

    return this.mapToResponseDto(backorderRequest);
  }

  async getUserBackorderRequests(
    userId: string,
    filters: BackorderRequestFiltersDto,
  ): Promise<BackorderRequestListResponseDto> {
    const result = await this.getUserBackorderRequestsUseCase.execute({
      userId,
      filters: {
        status: filters.status,
        priority: filters.priority,
        productId: filters.productId,
      },
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
      },
    });

    return {
      requests: result.requests.map((request) =>
        this.mapToResponseDto(request),
      ),
      total: result.total,
      hasMore: result.hasMore,
    };
  }

  async updateBackorderRequest(
    requestId: string,
    userId: string,
    updateDto: UpdateBackorderRequestDto,
  ): Promise<BackorderRequestResponseDto> {
    const backorderRequest = await this.updateBackorderRequestUseCase.execute({
      requestId,
      userId,
      updates: updateDto,
    });

    return this.mapToResponseDto(backorderRequest);
  }

  async cancelBackorderRequest(
    requestId: string,
    userId: string,
    cancelDto: CancelBackorderRequestDto,
  ): Promise<BackorderRequestResponseDto> {
    const backorderRequest = await this.cancelBackorderRequestUseCase.execute({
      requestId,
      userId,
      reason: cancelDto.reason,
    });

    return this.mapToResponseDto(backorderRequest);
  }

  async getBackorderSummary(userId: string): Promise<any> {
    const summary = await this.backorderRepository.getBackorderSummary(userId);
    return summary;
  }

  private mapToResponseDto(
    backorderRequest: BackorderRequest,
  ): BackorderRequestResponseDto {
    return {
      id: backorderRequest.id,
      userId: backorderRequest.userId,
      productId: backorderRequest.productId,
      quantity: backorderRequest.quantity,
      maxPrice: backorderRequest.maxPrice,
      priority: backorderRequest.priority,
      status: backorderRequest.status,
      notificationPreferences: backorderRequest.notificationPreferences,
      expectedDeliveryDate:
        backorderRequest.expectedDeliveryDate?.toISOString(),
      notes: backorderRequest.notes,
      createdAt: backorderRequest.createdAt.toISOString(),
      updatedAt: backorderRequest.updatedAt.toISOString(),
    };
  }
}
