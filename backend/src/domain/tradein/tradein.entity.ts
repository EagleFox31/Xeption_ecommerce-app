export enum DeviceCondition {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  BROKEN = "broken",
}

export enum TradeInStatus {
  PENDING = "pending",
  EVALUATING = "evaluating",
  APPROVED = "approved",
  REJECTED = "rejected",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface Device {
  id: string;
  brand: string;
  model: string;
  category: string;
  specifications?: Record<string, any>;
  baseValue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TradeInRequest {
  id: string;
  userId: string;
  deviceId: string;
  device?: Device;
  condition: DeviceCondition;
  description?: string;
  images: string[];
  estimatedValue: number;
  finalValue?: number;
  status: TradeInStatus;
  evaluatorNotes?: string;
  evaluatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TradeInEvaluation {
  requestId: string;
  evaluatorId: string;
  condition: DeviceCondition;
  functionalityScore: number; // 0-100
  cosmeticScore: number; // 0-100
  marketValue: number;
  finalValue: number;
  notes: string;
  evaluatedAt: Date;
}
