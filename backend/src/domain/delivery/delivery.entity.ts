/**
 * Entités métier pour le module delivery
 * Gestion des zones de livraison et calcul des frais
 */

export interface DeliveryZone {
  id: string;
  region: string;
  city: string;
  commune?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryCost {
  id: string;
  zoneId: string;
  baseFee: number;
  weightMultiplier: number;
  distanceMultiplier: number;
  minFee: number;
  maxFee: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryCalculation {
  zoneId: string;
  region: string;
  city: string;
  commune?: string;
  baseFee: number;
  weightFee: number;
  distanceFee: number;
  totalFee: number;
  estimatedDays: number;
}

export interface DeliveryRequest {
  region: string;
  city: string;
  commune?: string;
  weight?: number; // en kg
  distance?: number; // en km
}
