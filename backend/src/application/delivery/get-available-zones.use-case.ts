/**
 * Use case pour récupérer les zones de livraison disponibles
 */

import { Injectable, Inject } from "@nestjs/common";
import { DeliveryRepositoryPort, DELIVERY_REPOSITORY } from "../../domain/delivery/delivery.port";
import { DeliveryZone } from "../../domain/delivery/delivery.entity";

@Injectable()
export class GetAvailableZonesUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort
  ) {}

  async execute(): Promise<DeliveryZone[]> {
    return await this.deliveryRepository.findActiveZones();
  }

  async getRegions(): Promise<string[]> {
    return await this.deliveryRepository.findAvailableRegions();
  }

  async getCitiesByRegion(region: string): Promise<string[]> {
    if (!region?.trim()) {
      throw new Error("La région est obligatoire");
    }
    return await this.deliveryRepository.findCitiesByRegion(region);
  }

  async getCommunesByCity(region: string, city: string): Promise<string[]> {
    if (!region?.trim()) {
      throw new Error("La région est obligatoire");
    }
    if (!city?.trim()) {
      throw new Error("La ville est obligatoire");
    }
    return await this.deliveryRepository.findCommunesByCity(region, city);
  }
}
