import { Injectable } from "@nestjs/common";
import { CreateTradeInRequestUseCase } from "../../application/tradein/create-tradein-request.use-case";
import { GetTradeInRequestUseCase } from "../../application/tradein/get-tradein-request.use-case";
import { GetUserTradeInRequestsUseCase } from "../../application/tradein/get-user-tradein-requests.use-case";
import { SearchDevicesUseCase } from "../../application/tradein/search-devices.use-case";
import { EvaluateTradeInUseCase } from "../../application/tradein/evaluate-tradein.use-case";
import { TradeInRepositoryPort } from "../../domain/tradein/tradein.port";
import {
  DeviceCondition,
  TradeInStatus,
  TradeInRequest,
  Device,
} from "../../domain/tradein/tradein.entity";

@Injectable()
export class TradeInService {
  constructor(
    private readonly createTradeInRequestUseCase: CreateTradeInRequestUseCase,
    private readonly getTradeInRequestUseCase: GetTradeInRequestUseCase,
    private readonly getUserTradeInRequestsUseCase: GetUserTradeInRequestsUseCase,
    private readonly searchDevicesUseCase: SearchDevicesUseCase,
    private readonly evaluateTradeInUseCase: EvaluateTradeInUseCase,
    private readonly tradeInRepository: TradeInRepositoryPort,
  ) {}

  async createTradeInRequest(
    userId: string,
    deviceId: string,
    condition: DeviceCondition,
    description?: string,
    images?: string[],
  ): Promise<TradeInRequest> {
    return await this.createTradeInRequestUseCase.execute(
      userId,
      deviceId,
      condition,
      description,
      images,
    );
  }

  async getTradeInRequest(
    id: string,
    userId?: string,
  ): Promise<TradeInRequest> {
    return await this.getTradeInRequestUseCase.execute(id, userId);
  }

  async getUserTradeInRequests(userId: string): Promise<TradeInRequest[]> {
    return await this.getUserTradeInRequestsUseCase.execute(userId);
  }

  async searchDevices(query: string, category?: string): Promise<Device[]> {
    return await this.searchDevicesUseCase.execute(query, category);
  }

  async getDevicesByCategory(category: string): Promise<Device[]> {
    return await this.tradeInRepository.getDevicesByCategory(category);
  }

  async evaluateTradeIn(
    requestId: string,
    evaluatorId: string,
    condition: DeviceCondition,
    functionalityScore: number,
    cosmeticScore: number,
    notes: string,
  ): Promise<TradeInRequest> {
    return await this.evaluateTradeInUseCase.execute(
      requestId,
      evaluatorId,
      condition,
      functionalityScore,
      cosmeticScore,
      notes,
    );
  }

  async updateTradeInStatus(
    id: string,
    status: TradeInStatus,
    evaluatorNotes?: string,
  ): Promise<TradeInRequest> {
    return await this.tradeInRepository.updateTradeInRequest(id, {
      status,
      evaluatorNotes,
      evaluatedAt:
        status === TradeInStatus.APPROVED || status === TradeInStatus.REJECTED
          ? new Date()
          : undefined,
    });
  }

  async calculateEstimatedValue(
    deviceId: string,
    condition: DeviceCondition,
  ): Promise<number> {
    const device = await this.tradeInRepository.getDeviceById(deviceId);
    if (!device) {
      throw new Error("Device not found");
    }

    const conditionMultipliers = {
      [DeviceCondition.EXCELLENT]: 0.85,
      [DeviceCondition.GOOD]: 0.7,
      [DeviceCondition.FAIR]: 0.5,
      [DeviceCondition.POOR]: 0.3,
      [DeviceCondition.BROKEN]: 0.15,
    };

    const multiplier = conditionMultipliers[condition] || 0.15;
    return Math.round(device.baseValue * multiplier);
  }
}
