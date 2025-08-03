import { Inject, Injectable } from "@nestjs/common";
import { DeviceCondition } from "./tradein.entity";
import { TRADEIN_REPOSITORY, TradeInRepositoryPort } from "./tradein.port";

@Injectable()
export class TradeInValuationService {
  constructor(
    @Inject(TRADEIN_REPOSITORY)
    private readonly tradeInRepository: TradeInRepositoryPort,
  ) {}

  async estimate(
    deviceId: string,
    condition: DeviceCondition,
  ): Promise<number> {
    const device = await this.tradeInRepository.getDeviceById(deviceId);
    if (!device) {
      throw new Error("Device not found");
    }

    const multipliers: Record<DeviceCondition, number> = {
      [DeviceCondition.EXCELLENT]: 0.85,
      [DeviceCondition.GOOD]: 0.7,
      [DeviceCondition.FAIR]: 0.5,
      [DeviceCondition.POOR]: 0.3,
      [DeviceCondition.BROKEN]: 0.15,
    };

    const multiplier = multipliers[condition] ?? 0.15;
    return Math.round(device.baseValue * multiplier);
  }
}

