import {
  TradeInRequest,
  Device,
  TradeInEvaluation,
  DeviceCondition,
  TradeInStatus,
} from "./tradein.entity";

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

export interface TradeInServicePort {
  createTradeInRequest(
    userId: string,
    deviceId: string,
    condition: DeviceCondition,
    description?: string,
    images?: string[],
  ): Promise<TradeInRequest>;

  getTradeInRequest(id: string, userId?: string): Promise<TradeInRequest>;
  getUserTradeInRequests(userId: string): Promise<TradeInRequest[]>;

  updateTradeInStatus(
    id: string,
    status: TradeInStatus,
    evaluatorNotes?: string,
  ): Promise<TradeInRequest>;

  evaluateTradeIn(
    requestId: string,
    evaluatorId: string,
    condition: DeviceCondition,
    functionalityScore: number,
    cosmeticScore: number,
    notes: string,
  ): Promise<TradeInRequest>;

  searchDevices(query: string, category?: string): Promise<Device[]>;
  getDevicesByCategory(category: string): Promise<Device[]>;

  calculateEstimatedValue(
    deviceId: string,
    condition: DeviceCondition,
  ): Promise<number>;
}
