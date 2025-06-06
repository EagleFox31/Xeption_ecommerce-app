/**
 * Entités métier pour le module backorder
 * Gestion des précommandes de produits hors stock
 */

export enum BackorderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  NOTIFIED = "notified",
  FULFILLED = "fulfilled",
  CANCELLED = "cancelled",
}

export enum BackorderPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export interface BackorderRequest {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  maxPrice?: number;
  priority: BackorderPriority;
  status: BackorderStatus;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  expectedDeliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BackorderNotification {
  id: string;
  backorderRequestId: string;
  type: "availability" | "price_change" | "status_update";
  message: string;
  sentAt: Date;
  channels: string[];
}

export interface ProductAvailability {
  productId: string;
  isAvailable: boolean;
  currentStock: number;
  expectedRestockDate?: Date;
  currentPrice: number;
}

export interface BackorderSummary {
  totalRequests: number;
  pendingRequests: number;
  fulfilledRequests: number;
  averageWaitTime: number;
  topRequestedProducts: {
    productId: string;
    requestCount: number;
  }[];
}
