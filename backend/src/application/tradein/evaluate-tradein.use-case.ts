import { Injectable, Inject } from "@nestjs/common";
import { TradeInRepositoryPort, TRADEIN_REPOSITORY } from "../../domain/tradein/tradein.port";
import {
  TradeInRequest,
  DeviceCondition,
  TradeInStatus,
} from "../../domain/tradein/tradein.entity";
import { TradeInValuationService } from "../../domain/tradein/tradein-valuation.service";

@Injectable()
export class EvaluateTradeInUseCase {
  constructor(
    @Inject(TRADEIN_REPOSITORY)
    private readonly tradeInRepository: TradeInRepositoryPort,
    private readonly valuationService: TradeInValuationService,
  ) {}

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

    // Calculer la valeur finale
    const marketValue = await this.valuationService.estimate(
      tradeInRequest.deviceId,
      condition,
    );
    const functionalityMultiplier = functionalityScore / 100;
    const cosmeticMultiplier = cosmeticScore / 100;

    const finalValue = Math.round(
      marketValue * functionalityMultiplier * cosmeticMultiplier,
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
      },
    );

    return updatedRequest;
  }

}
