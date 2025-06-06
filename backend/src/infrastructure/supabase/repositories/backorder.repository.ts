/**
 * Repository Supabase pour le module backorder
 * Implémentation de l'accès aux données via Supabase
 */

import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { BackorderRepository } from "../../../domain/backorder/backorder.port";
import {
  BackorderRequest,
  BackorderNotification,
  ProductAvailability,
  BackorderSummary,
  BackorderStatus,
  BackorderPriority,
} from "../../../domain/backorder/backorder.entity";

@Injectable()
export class SupabaseBackorderRepository implements BackorderRepository {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );
  }

  async createBackorderRequest(
    request: Omit<BackorderRequest, "id" | "createdAt" | "updatedAt">,
  ): Promise<BackorderRequest> {
    const { data, error } = await this.supabase
      .from("backorder_requests")
      .insert({
        user_id: request.userId,
        product_id: request.productId,
        quantity: request.quantity,
        max_price: request.maxPrice,
        priority: request.priority,
        status: request.status,
        notification_preferences: request.notificationPreferences,
        expected_delivery_date: request.expectedDeliveryDate?.toISOString(),
        notes: request.notes,
      })
      .select()
      .single();

    if (error) {
      throw new Error(
        `Erreur lors de la création de la demande de précommande: ${error.message}`,
      );
    }

    return this.mapFromDatabase(data);
  }

  async getBackorderRequestById(id: string): Promise<BackorderRequest | null> {
    const { data, error } = await this.supabase
      .from("backorder_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Pas trouvé
      }
      throw new Error(
        `Erreur lors de la récupération de la demande: ${error.message}`,
      );
    }

    return this.mapFromDatabase(data);
  }

  async getUserBackorderRequests(
    userId: string,
    filters?: {
      status?: BackorderStatus;
      priority?: BackorderPriority;
      productId?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<BackorderRequest[]> {
    let query = this.supabase
      .from("backorder_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.priority) {
      query = query.eq("priority", filters.priority);
    }

    if (filters?.productId) {
      query = query.eq("product_id", filters.productId);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        (filters.offset || 0) + (filters.limit || 20) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(
        `Erreur lors de la récupération des demandes: ${error.message}`,
      );
    }

    return data.map((item) => this.mapFromDatabase(item));
  }

  async updateBackorderRequest(
    id: string,
    updates: Partial<BackorderRequest>,
  ): Promise<BackorderRequest> {
    const updateData: any = {};

    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.maxPrice !== undefined) updateData.max_price = updates.maxPrice;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.notificationPreferences !== undefined) {
      updateData.notification_preferences = updates.notificationPreferences;
    }
    if (updates.expectedDeliveryDate !== undefined) {
      updateData.expected_delivery_date =
        updates.expectedDeliveryDate?.toISOString();
    }
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.updatedAt !== undefined)
      updateData.updated_at = updates.updatedAt.toISOString();

    const { data, error } = await this.supabase
      .from("backorder_requests")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Erreur lors de la mise à jour de la demande: ${error.message}`,
      );
    }

    return this.mapFromDatabase(data);
  }

  async deleteBackorderRequest(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("backorder_requests")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(
        `Erreur lors de la suppression de la demande: ${error.message}`,
      );
    }
  }

  async createNotification(
    notification: Omit<BackorderNotification, "id" | "sentAt">,
  ): Promise<BackorderNotification> {
    const { data, error } = await this.supabase
      .from("backorder_notifications")
      .insert({
        backorder_request_id: notification.backorderRequestId,
        type: notification.type,
        message: notification.message,
        channels: notification.channels,
      })
      .select()
      .single();

    if (error) {
      throw new Error(
        `Erreur lors de la création de la notification: ${error.message}`,
      );
    }

    return {
      id: data.id,
      backorderRequestId: data.backorder_request_id,
      type: data.type,
      message: data.message,
      channels: data.channels,
      sentAt: new Date(data.sent_at),
    };
  }

  async getNotificationsByBackorderRequest(
    backorderRequestId: string,
  ): Promise<BackorderNotification[]> {
    const { data, error } = await this.supabase
      .from("backorder_notifications")
      .select("*")
      .eq("backorder_request_id", backorderRequestId)
      .order("sent_at", { ascending: false });

    if (error) {
      throw new Error(
        `Erreur lors de la récupération des notifications: ${error.message}`,
      );
    }

    return data.map((item) => ({
      id: item.id,
      backorderRequestId: item.backorder_request_id,
      type: item.type,
      message: item.message,
      channels: item.channels,
      sentAt: new Date(item.sent_at),
    }));
  }

  async checkProductAvailability(
    productId: string,
  ): Promise<ProductAvailability> {
    // Mock implementation - à remplacer par une vraie requête
    return {
      productId,
      isAvailable: false,
      currentStock: 0,
      expectedRestockDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Dans 2 semaines
      currentPrice: 0,
    };
  }

  async getBackorderRequestsByProduct(
    productId: string,
  ): Promise<BackorderRequest[]> {
    const { data, error } = await this.supabase
      .from("backorder_requests")
      .select("*")
      .eq("product_id", productId)
      .eq("status", BackorderStatus.PENDING)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(
        `Erreur lors de la récupération des demandes par produit: ${error.message}`,
      );
    }

    return data.map((item) => this.mapFromDatabase(item));
  }

  async getBackorderSummary(userId?: string): Promise<BackorderSummary> {
    let query = this.supabase
      .from("backorder_requests")
      .select("status, created_at, product_id");

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(
        `Erreur lors de la récupération du résumé: ${error.message}`,
      );
    }

    const totalRequests = data.length;
    const pendingRequests = data.filter(
      (item) => item.status === BackorderStatus.PENDING,
    ).length;
    const fulfilledRequests = data.filter(
      (item) => item.status === BackorderStatus.FULFILLED,
    ).length;

    // Calcul du temps d'attente moyen (simplifié)
    const averageWaitTime = 14; // jours (mock)

    // Top des produits les plus demandés
    const productCounts = data.reduce(
      (acc, item) => {
        acc[item.product_id] = (acc[item.product_id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topRequestedProducts = Object.entries(productCounts)
      .map(([productId, count]) => ({ productId, requestCount: count }))
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, 5);

    return {
      totalRequests,
      pendingRequests,
      fulfilledRequests,
      averageWaitTime,
      topRequestedProducts,
    };
  }

  async getExpiredBackorderRequests(days: number): Promise<BackorderRequest[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await this.supabase
      .from("backorder_requests")
      .select("*")
      .eq("status", BackorderStatus.PENDING)
      .lt("created_at", cutoffDate.toISOString());

    if (error) {
      throw new Error(
        `Erreur lors de la récupération des demandes expirées: ${error.message}`,
      );
    }

    return data.map((item) => this.mapFromDatabase(item));
  }

  private mapFromDatabase(data: any): BackorderRequest {
    return {
      id: data.id,
      userId: data.user_id,
      productId: data.product_id,
      quantity: data.quantity,
      maxPrice: data.max_price,
      priority: data.priority,
      status: data.status,
      notificationPreferences: data.notification_preferences,
      expectedDeliveryDate: data.expected_delivery_date
        ? new Date(data.expected_delivery_date)
        : undefined,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
