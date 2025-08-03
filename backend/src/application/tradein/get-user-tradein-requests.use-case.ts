import { Injectable, Inject } from "@nestjs/common";
import { TradeInRepositoryPort, TRADEIN_REPOSITORY } from "../../domain/tradein/tradein.port";
import { TradeInRequest } from "../../domain/tradein/tradein.entity";

@Injectable()
export class GetUserTradeInRequestsUseCase {
  constructor(
    @Inject(TRADEIN_REPOSITORY)
    private readonly tradeInRepository: TradeInRepositoryPort
  ) {}

  async execute(userId: string): Promise<TradeInRequest[]> {
    return await this.tradeInRepository.getTradeInRequestsByUserId(userId);
  }
}
