/**
 * Ports (interfaces) pour le module backorder
 * Définit les contrats pour l'accès aux données et services
 */

import {
  BackorderRequest,
  BackorderNotification,
  ProductAvailability,
  BackorderSummary,
  BackorderStatus,
  BackorderPriority,
} from "./backorder.entity";

export interface BackorderRepository {
  // Gestion des demandes de précommande
  createBackorderRequest(
    request: Omit<BackorderRequest, "id" | "createdAt" | "updatedAt">,
  ): Promise<BackorderRequest>;
  getBackorderRequestById(id: string): Promise<BackorderRequest | null>;
  getUserBackorderRequests(
    userId: string,
    filters?: {
      status?: BackorderStatus;
      priority?: BackorderPriority;
      productId?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<BackorderRequest[]>;
  updateBackorderRequest(
    id: string,
    updates: Partial<BackorderRequest>,
  ): Promise<BackorderRequest>;
  deleteBackorderRequest(id: string): Promise<void>;

  // Gestion des notifications
  createNotification(
    notification: Omit<BackorderNotification, "id" | "sentAt">,
  ): Promise<BackorderNotification>;
  getNotificationsByBackorderRequest(
    backorderRequestId: string,
  ): Promise<BackorderNotification[]>;

  // Vérification de disponibilité des produits
  checkProductAvailability(productId: string): Promise<ProductAvailability>;
  getBackorderRequestsByProduct(productId: string): Promise<BackorderRequest[]>;

  // Statistiques et rapports
  getBackorderSummary(userId?: string): Promise<BackorderSummary>;
  getExpiredBackorderRequests(days: number): Promise<BackorderRequest[]>;
}

export interface BackorderNotificationService {
  sendAvailabilityNotification(
    backorderRequest: BackorderRequest,
    productAvailability: ProductAvailability,
  ): Promise<void>;
  sendStatusUpdateNotification(
    backorderRequest: BackorderRequest,
  ): Promise<void>;
  sendPriceChangeNotification(
    backorderRequest: BackorderRequest,
    newPrice: number,
  ): Promise<void>;
}

export interface ProductStockService {
  checkStockLevel(productId: string): Promise<number>;
  getExpectedRestockDate(productId: string): Promise<Date | null>;
  subscribeToStockUpdates(
    productId: string,
    callback: (stock: number) => void,
  ): Promise<void>;
}
