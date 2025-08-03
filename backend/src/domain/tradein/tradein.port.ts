import {
  TradeInRequest,
  Device,
  TradeInEvaluation,
  DeviceCondition,
  TradeInStatus,
} from "./tradein.entity";

export const TRADEIN_REPOSITORY = Symbol('TradeInRepositoryPort');

export interface TradeInRepositoryPort {
  // Trade-in requests
  createTradeInRequest(
    request: Omit<TradeInRequest, "id" | "createdAt" | "updatedAt">,
  ): Promise<TradeInRequest>;
  getTradeInRequestById(id: string): Promise<TradeInRequest | null>;
  getTradeInRequestsByUserId(userId: string): Promise<TradeInRequest[]>;
  updateTradeInRequest(
    id: string,
    updates: Partial<TradeInRequest>,
  ): Promise<TradeInRequest>;
  deleteTradeInRequest(id: string): Promise<void>;

  // Devices
  getDeviceById(id: string): Promise<Device | null>;
  searchDevices(query: string, category?: string): Promise<Device[]>;
  getDevicesByCategory(category: string): Promise<Device[]>;

  // Evaluations
  createEvaluation(
    evaluation: Omit<TradeInEvaluation, "evaluatedAt">,
  ): Promise<TradeInEvaluation>;
  getEvaluationByRequestId(
    requestId: string,
  ): Promise<TradeInEvaluation | null>;
}
