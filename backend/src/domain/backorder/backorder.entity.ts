/**
 * Entités pour le module backorder
 * Définit les objets de domaine pour les précommandes
 */

/**
 * Statuts possibles pour une précommande
 */
export enum BackorderStatus {
  PENDING = "pending",       // En attente de traitement
  PROCESSING = "processing", // En cours de traitement
  FULFILLED = "fulfilled",   // Complétée, produit disponible
  CANCELLED = "cancelled",   // Annulée par l'utilisateur
  EXPIRED = "expired",       // Expirée, dépassant la date limite
  REJECTED = "rejected",     // Rejetée par l'administrateur
  NOTIFIED = "notified"      // Client notifié de la disponibilité
}

/**
 * Niveaux de priorité pour une précommande
 */
export enum BackorderPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent"
}

/**
 * Préférences de notification de l'utilisateur
 */
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

/**
 * Demande de précommande
 */
export interface BackorderRequest {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  maxPrice?: number;
  priority: BackorderPriority;
  status: BackorderStatus;
  notificationPreferences: NotificationPreferences;
  expectedDeliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notification envoyée à l'utilisateur
 */
export interface BackorderNotification {
  id: string;
  backorderRequestId: string;
  type: string;
  message: string;
  sentAt: Date;
  readAt?: Date;
}

/**
 * Information sur la disponibilité d'un produit
 */
export interface ProductAvailability {
  productId: string;
  inStock: boolean;
  quantity: number;
  expectedRestockDate?: Date;
  price: number;
}

/**
 * Résumé des précommandes
 */
export interface BackorderSummary {
  totalRequests: number;
  pendingRequests: number;
  fulfilledRequests: number;
  cancelledRequests: number;
  mostRequestedProducts: {
    productId: string;
    count: number;
  }[];
}
