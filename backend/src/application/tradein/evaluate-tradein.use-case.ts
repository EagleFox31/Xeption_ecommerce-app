import { Injectable } from "@nestjs/common";
import { TradeInRepositoryPort } from "../../domain/tradein/tradein.port";
import {
  TradeInRequest,
  DeviceCondition,
  TradeInStatus,
} from "../../domain/tradein/tradein.entity";

@Injectable()
export class EvaluateTradeInUseCase {
  constructor(private readonly tradeInRepository: TradeInRepositoryPort) {}

  async execute(
    requestId: string,
    evaluatorId: string,
    condition: DeviceCondition,
    functionalityScore: number,
    cosmeticScore: number,
    notes: string,
  ): Promise<TradeInRequest> {
    // Vérifier que la demande existe
    const tradeInRequest =
      await this.tradeInRepository.getTradeInRequestById(requestId);
    if (!tradeInRequest) {
      throw new Error("Trade-in request not found");
    }

    // Vérifier que la demande est en attente d'évaluation
    if (
      tradeInRequest.status !== TradeInStatus.PENDING &&
      tradeInRequest.status !== TradeInStatus.EVALUATING
    ) {
      throw new Error(
        "Trade-in request cannot be evaluated in its current status",
      );
    }

    // Valider les scores
    if (
      functionalityScore < 0 ||
      functionalityScore > 100 ||
      cosmeticScore < 0 ||
      cosmeticScore > 100
    ) {
      throw new Error("Scores must be between 0 and 100");
    }

    // Récupérer les informations de l'appareil
    const device = await this.tradeInRepository.getDeviceById(
      tradeInRequest.deviceId,
    );
    if (!device) {
      throw new Error("Device not found");
    }

    // Calculer la valeur finale
    const marketValue = device.baseValue;
    const conditionMultiplier = this.getConditionMultiplier(condition);
    const functionalityMultiplier = functionalityScore / 100;
    const cosmeticMultiplier = cosmeticScore / 100;

    const finalValue = Math.round(
      marketValue *
        conditionMultiplier *
        functionalityMultiplier *
        cosmeticMultiplier,
    );

    // Créer l'évaluation
    await this.tradeInRepository.createEvaluation({
      requestId,
      evaluatorId,
      condition,
      functionalityScore,
      cosmeticScore,
      marketValue,
      finalValue,
      notes,
    });

    // Mettre à jour la demande
    const updatedRequest = await this.tradeInRepository.updateTradeInRequest(
      requestId,
      {
        status: TradeInStatus.APPROVED,
        finalValue,
        evaluatorNotes: notes,
        evaluatedAt: new Date(),
      },
    );

    return updatedRequest;
  }

  private getConditionMultiplier(condition: DeviceCondition): number {
    const multipliers = {
      [DeviceCondition.EXCELLENT]: 0.85,
      [DeviceCondition.GOOD]: 0.7,
      [DeviceCondition.FAIR]: 0.5,
      [DeviceCondition.POOR]: 0.3,
      [DeviceCondition.BROKEN]: 0.15,
    };

    return multipliers[condition] || 0.15;
  }
}
