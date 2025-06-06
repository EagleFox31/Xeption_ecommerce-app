import { Injectable } from "@nestjs/common";
import { TradeInRepositoryPort } from "../../domain/tradein/tradein.port";
import { TradeInRequest } from "../../domain/tradein/tradein.entity";

@Injectable()
export class GetTradeInRequestUseCase {
  constructor(private readonly tradeInRepository: TradeInRepositoryPort) {}

  async execute(id: string, userId?: string): Promise<TradeInRequest> {
    const tradeInRequest =
      await this.tradeInRepository.getTradeInRequestById(id);

    if (!tradeInRequest) {
      throw new Error("Trade-in request not found");
    }

    // Vérifier que l'utilisateur a le droit d'accéder à cette demande
    if (userId && tradeInRequest.userId !== userId) {
      throw new Error(
        "Access denied: You can only view your own trade-in requests",
      );
    }

    return tradeInRequest;
  }
}
