import { Injectable } from "@nestjs/common";
import { TradeInRepositoryPort } from "../../domain/tradein/tradein.port";
import {
  TradeInRequest,
  DeviceCondition,
} from "../../domain/tradein/tradein.entity";

@Injectable()
export class CreateTradeInRequestUseCase {
  constructor(private readonly tradeInRepository: TradeInRepositoryPort) {}

  async execute(
    userId: string,
    deviceId: string,
    condition: DeviceCondition,
    description?: string,
    images: string[] = [],
  ): Promise<TradeInRequest> {
    // Vérifier que l'appareil existe
    const device = await this.tradeInRepository.getDeviceById(deviceId);
    if (!device) {
      throw new Error("Device not found");
    }

    // Calculer la valeur estimée basée sur l'état
    const estimatedValue = this.calculateEstimatedValue(
      device.baseValue,
      condition,
    );

    // Créer la demande de reprise
    const tradeInRequest = await this.tradeInRepository.createTradeInRequest({
      userId,
      deviceId,
      condition,
      description,
      images,
      estimatedValue,
      status: "pending" as any,
    });

    return tradeInRequest;
  }

  private calculateEstimatedValue(
    baseValue: number,
    condition: DeviceCondition,
  ): number {
    const conditionMultipliers = {
      excellent: 0.85,
      good: 0.7,
      fair: 0.5,
      poor: 0.3,
      broken: 0.15,
    };

    const multiplier = conditionMultipliers[condition] || 0.15;
    return Math.round(baseValue * multiplier);
  }
}
