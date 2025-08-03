/**
 * Use case pour le calcul des frais de livraison
 * Logique métier pure, injectable et testable
 */

import { Injectable, Inject } from "@nestjs/common";
import { DeliveryRepositoryPort, DELIVERY_REPOSITORY } from "../../domain/delivery/delivery.port";
import {
  DeliveryRequest,
  DeliveryCalculation,
} from "../../domain/delivery/delivery.entity";

@Injectable()
export class CalculateDeliveryFeeUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort
  ) {}

  async execute(request: DeliveryRequest): Promise<DeliveryCalculation> {
    // Validation des données d'entrée
    this.validateRequest(request);

    // Recherche de la zone de livraison
    const zone = await this.deliveryRepository.findZoneByLocation(
      request.region,
      request.city,
      request.commune,
    );

    if (!zone) {
      throw new Error(
        `Zone de livraison non disponible pour ${request.region}, ${request.city}`,
      );
    }

    if (!zone.isActive) {
      throw new Error(`Livraison temporairement indisponible pour cette zone`);
    }

    // Récupération des coûts
    const cost = await this.deliveryRepository.getCostByZoneId(zone.id);
    if (!cost || !cost.isActive) {
      throw new Error(`Tarifs de livraison non configurés pour cette zone`);
    }

    // Calcul des frais
    const baseFee = cost.baseFee;
    const weightFee = this.calculateWeightFee(
      request.weight || 0,
      cost.weightMultiplier,
    );
    const distanceFee = this.calculateDistanceFee(
      request.distance || 0,
      cost.distanceMultiplier,
    );

    let totalFee = baseFee + weightFee + distanceFee;

    // Application des limites min/max
    totalFee = Math.max(cost.minFee, Math.min(cost.maxFee, totalFee));

    // Estimation des jours de livraison (logique simplifiée)
    const estimatedDays = this.calculateEstimatedDays(
      request.region,
      request.city,
    );

    return {
      zoneId: zone.id,
      region: zone.region,
      city: zone.city,
      commune: zone.commune,
      baseFee,
      weightFee,
      distanceFee,
      totalFee: Math.round(totalFee),
      estimatedDays,
    };
  }

  private validateRequest(request: DeliveryRequest): void {
    if (!request.region?.trim()) {
      throw new Error("La région est obligatoire");
    }
    if (!request.city?.trim()) {
      throw new Error("La ville est obligatoire");
    }
    if (request.weight && request.weight < 0) {
      throw new Error("Le poids ne peut pas être négatif");
    }
    if (request.distance && request.distance < 0) {
      throw new Error("La distance ne peut pas être négative");
    }
  }

  private calculateWeightFee(weight: number, multiplier: number): number {
    if (weight <= 1) return 0; // Premier kg gratuit
    return (weight - 1) * multiplier;
  }

  private calculateDistanceFee(distance: number, multiplier: number): number {
    if (distance <= 5) return 0; // Premiers 5km gratuits
    return (distance - 5) * multiplier;
  }

  private calculateEstimatedDays(region: string, city: string): number {
    // Logique simplifiée pour l'estimation
    const majorCities = ["Douala", "Yaoundé", "Bafoussam", "Bamenda", "Garoua"];

    if (majorCities.includes(city)) {
      return 1; // Livraison le jour même ou lendemain
    }

    // Estimation basée sur la région
    const regionDays: Record<string, number> = {
      Centre: 2,
      Littoral: 2,
      Ouest: 3,
      "Nord-Ouest": 3,
      "Sud-Ouest": 3,
      Nord: 4,
      Adamaoua: 4,
      Est: 5,
      Sud: 5,
      "Extrême-Nord": 5,
    };

    return regionDays[region] || 3;
  }
}
