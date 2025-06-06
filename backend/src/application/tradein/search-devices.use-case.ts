import { Injectable } from "@nestjs/common";
import { TradeInRepositoryPort } from "../../domain/tradein/tradein.port";
import { Device } from "../../domain/tradein/tradein.entity";

@Injectable()
export class SearchDevicesUseCase {
  constructor(private readonly tradeInRepository: TradeInRepositoryPort) {}

  async execute(query: string, category?: string): Promise<Device[]> {
    if (!query || query.trim().length < 2) {
      throw new Error("Search query must be at least 2 characters long");
    }

    return await this.tradeInRepository.searchDevices(query.trim(), category);
  }
}
