import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { TradeInRepositoryPort } from "../../../domain/tradein/tradein.port";
import {
  TradeInRequest,
  Device,
  TradeInEvaluation,
  DeviceCondition,
  TradeInStatus,
} from "../../../domain/tradein/tradein.entity";

@Injectable()
export class TradeInRepository implements TradeInRepositoryPort {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );
  }

  async createTradeInRequest(
    request: Omit<TradeInRequest, "id" | "createdAt" | "updatedAt">,
  ): Promise<TradeInRequest> {
    const { data, error } = await this.supabase
      .from("tradein_requests")
      .insert({
        user_id: request.userId,
        device_id: request.deviceId,
        condition: request.condition,
        description: request.description,
        images: request.images,
        estimated_value: request.estimatedValue,
        status: request.status,
      })
      .select(
        `
        *,
        device:devices(*)
      `,
      )
      .single();

    if (error) {
      throw new Error(`Failed to create trade-in request: ${error.message}`);
    }

    return this.mapTradeInRequestFromDb(data);
  }

  async getTradeInRequestById(id: string): Promise<TradeInRequest | null> {
    const { data, error } = await this.supabase
      .from("tradein_requests")
      .select(
        `
        *,
        device:devices(*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to get trade-in request: ${error.message}`);
    }

    return this.mapTradeInRequestFromDb(data);
  }

  async getTradeInRequestsByUserId(userId: string): Promise<TradeInRequest[]> {
    const { data, error } = await this.supabase
      .from("tradein_requests")
      .select(
        `
        *,
        device:devices(*)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get user trade-in requests: ${error.message}`);
    }

    return data.map(this.mapTradeInRequestFromDb);
  }

  async updateTradeInRequest(
    id: string,
    updates: Partial<TradeInRequest>,
  ): Promise<TradeInRequest> {
    const updateData: any = {};

    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.finalValue !== undefined)
      updateData.final_value = updates.finalValue;
    if (updates.evaluatorNotes !== undefined)
      updateData.evaluator_notes = updates.evaluatorNotes;
    if (updates.evaluatedAt !== undefined)
      updateData.evaluated_at = updates.evaluatedAt.toISOString();

    const { data, error } = await this.supabase
      .from("tradein_requests")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        device:devices(*)
      `,
      )
      .single();

    if (error) {
      throw new Error(`Failed to update trade-in request: ${error.message}`);
    }

    return this.mapTradeInRequestFromDb(data);
  }

  async deleteTradeInRequest(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("tradein_requests")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete trade-in request: ${error.message}`);
    }
  }

  async getDeviceById(id: string): Promise<Device | null> {
    const { data, error } = await this.supabase
      .from("devices")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to get device: ${error.message}`);
    }

    return this.mapDeviceFromDb(data);
  }

  async searchDevices(query: string, category?: string): Promise<Device[]> {
    let queryBuilder = this.supabase
      .from("devices")
      .select("*")
      .or(`brand.ilike.%${query}%,model.ilike.%${query}%`);

    if (category) {
      queryBuilder = queryBuilder.eq("category", category);
    }

    const { data, error } = await queryBuilder.order("brand").limit(20);

    if (error) {
      throw new Error(`Failed to search devices: ${error.message}`);
    }

    return data.map(this.mapDeviceFromDb);
  }

  async getDevicesByCategory(category: string): Promise<Device[]> {
    const { data, error } = await this.supabase
      .from("devices")
      .select("*")
      .eq("category", category)
      .order("brand");

    if (error) {
      throw new Error(`Failed to get devices by category: ${error.message}`);
    }

    return data.map(this.mapDeviceFromDb);
  }

  async createEvaluation(
    evaluation: Omit<TradeInEvaluation, "evaluatedAt">,
  ): Promise<TradeInEvaluation> {
    const { data, error } = await this.supabase
      .from("tradein_evaluations")
      .insert({
        request_id: evaluation.requestId,
        evaluator_id: evaluation.evaluatorId,
        condition: evaluation.condition,
        functionality_score: evaluation.functionalityScore,
        cosmetic_score: evaluation.cosmeticScore,
        market_value: evaluation.marketValue,
        final_value: evaluation.finalValue,
        notes: evaluation.notes,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create evaluation: ${error.message}`);
    }

    return this.mapEvaluationFromDb(data);
  }

  async getEvaluationByRequestId(
    requestId: string,
  ): Promise<TradeInEvaluation | null> {
    const { data, error } = await this.supabase
      .from("tradein_evaluations")
      .select("*")
      .eq("request_id", requestId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to get evaluation: ${error.message}`);
    }

    return this.mapEvaluationFromDb(data);
  }

  private mapTradeInRequestFromDb(data: any): TradeInRequest {
    return {
      id: data.id,
      userId: data.user_id,
      deviceId: data.device_id,
      device: data.device ? this.mapDeviceFromDb(data.device) : undefined,
      condition: data.condition as DeviceCondition,
      description: data.description,
      images: data.images || [],
      estimatedValue: data.estimated_value,
      finalValue: data.final_value,
      status: data.status as TradeInStatus,
      evaluatorNotes: data.evaluator_notes,
      evaluatedAt: data.evaluated_at ? new Date(data.evaluated_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapDeviceFromDb(data: any): Device {
    return {
      id: data.id,
      brand: data.brand,
      model: data.model,
      category: data.category,
      specifications: data.specifications,
      baseValue: data.base_value,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapEvaluationFromDb(data: any): TradeInEvaluation {
    return {
      requestId: data.request_id,
      evaluatorId: data.evaluator_id,
      condition: data.condition as DeviceCondition,
      functionalityScore: data.functionality_score,
      cosmeticScore: data.cosmetic_score,
      marketValue: data.market_value,
      finalValue: data.final_value,
      notes: data.notes,
      evaluatedAt: new Date(data.evaluated_at),
    };
  }
}
