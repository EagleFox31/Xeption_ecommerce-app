/**
 * Service pour le module delivery
 * Orchestration des use cases
 */

import { Injectable } from "@nestjs/common";
import { CalculateDeliveryFeeUseCase } from "../../application/delivery/calculate-delivery-fee.use-case";
import { GetAvailableZonesUseCase } from "../../application/delivery/get-available-zones.use-case";
import {
  DeliveryRequest,
  DeliveryCalculation,
  DeliveryZone,
} from "../../domain/delivery/delivery.entity";
import { DeliveryServicePort } from "../../domain/delivery/delivery.port";

@Injectable()
export class DeliveryService implements DeliveryServicePort {
  constructor(
    private readonly calculateDeliveryFeeUseCase: CalculateDeliveryFeeUseCase,
    private readonly getAvailableZonesUseCase: GetAvailableZonesUseCase,
  ) {}

  async calculateDeliveryFee(
    request: DeliveryRequest,
  ): Promise<DeliveryCalculation> {
    return await this.calculateDeliveryFeeUseCase.execute(request);
  }

  async isDeliveryAvailable(
    region: string,
    city: string,
    commune?: string,
  ): Promise<boolean> {
    try {
      const calculation = await this.calculateDeliveryFee({
        region,
        city,
        commune,
      });
      return !!calculation;
    } catch (error) {
      return false;
    }
  }

  async getAvailableZones(): Promise<DeliveryZone[]> {
    return await this.getAvailableZonesUseCase.execute();
  }

  async getAvailableRegions(): Promise<string[]> {
    return await this.getAvailableZonesUseCase.getRegions();
  }

  async getCitiesByRegion(region: string): Promise<string[]> {
    return await this.getAvailableZonesUseCase.getCitiesByRegion(region);
  }

  async getCommunesByCity(region: string, city: string): Promise<string[]> {
    return await this.getAvailableZonesUseCase.getCommunesByCity(region, city);
  }
}
