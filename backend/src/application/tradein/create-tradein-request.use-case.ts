import { Injectable, Inject } from "@nestjs/common";
import { TradeInRepositoryPort, TRADEIN_REPOSITORY } from "../../domain/tradein/tradein.port";
import {
  TradeInRequest,
  DeviceCondition,
  TradeInStatus,
} from "../../domain/tradein/tradein.entity";
import { TradeInValuationService } from "../../domain/tradein/tradein-valuation.service";

@Injectable()
export class CreateTradeInRequestUseCase {
  constructor(
    @Inject(TRADEIN_REPOSITORY)
    private readonly tradeInRepository: TradeInRepositoryPort,
    private readonly valuationService: TradeInValuationService,
  ) {}

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
    const estimatedValue = await this.valuationService.estimate(
      deviceId,
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
      status: TradeInStatus.PENDING,
    });

    return tradeInRequest;
  }

}
