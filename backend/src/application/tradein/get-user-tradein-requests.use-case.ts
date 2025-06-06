import { Injectable } from "@nestjs/common";
import { TradeInRepositoryPort } from "../../domain/tradein/tradein.port";
import { TradeInRequest } from "../../domain/tradein/tradein.entity";

@Injectable()
export class GetUserTradeInRequestsUseCase {
  constructor(private readonly tradeInRepository: TradeInRepositoryPort) {}

  async execute(userId: string): Promise<TradeInRequest[]> {
    return await this.tradeInRepository.getTradeInRequestsByUserId(userId);
  }
}
