/**
 * Ports (interfaces) pour le module delivery
 * Définit les contrats pour l'accès aux données
 */

import {
  DeliveryZone,
  DeliveryCost,
  DeliveryCalculation,
  DeliveryRequest,
} from "./delivery.entity";

/**
 * Injection token for DeliveryRepositoryPort
 */
export const DELIVERY_REPOSITORY = 'DELIVERY_REPOSITORY';

/**
 * Injection token for DeliveryServicePort
 */
export const DELIVERY_SERVICE = 'DELIVERY_SERVICE';

export interface DeliveryRepositoryPort {
  /**
   * Trouve une zone de livraison par région, ville et commune
   */
  findZoneByLocation(
    region: string,
    city: string,
    commune?: string,
  ): Promise<DeliveryZone | null>;

  /**
   * Récupère les coûts de livraison pour une zone
   */
  getCostByZoneId(zoneId: string): Promise<DeliveryCost | null>;

  /**
   * Liste toutes les zones de livraison actives
   */
  findActiveZones(): Promise<DeliveryZone[]>;

  /**
   * Liste toutes les régions disponibles
   */
  findAvailableRegions(): Promise<string[]>;

  /**
   * Liste les villes d'une région
   */
  findCitiesByRegion(region: string): Promise<string[]>;

  /**
   * Liste les communes d'une ville
   */
  findCommunesByCity(region: string, city: string): Promise<string[]>;
}

export interface DeliveryServicePort {
  /**
   * Calcule les frais de livraison
   */
  calculateDeliveryFee(request: DeliveryRequest): Promise<DeliveryCalculation>;

  /**
   * Vérifie si la livraison est disponible pour une zone
   */
  isDeliveryAvailable(
    region: string,
    city: string,
    commune?: string,
  ): Promise<boolean>;

  /**
   * Récupère les zones de livraison disponibles
   */
  getAvailableZones(): Promise<DeliveryZone[]>;
}
