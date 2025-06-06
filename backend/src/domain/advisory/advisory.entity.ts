export enum AdvisoryRequestStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum AdvisoryRequestPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export interface AdvisoryBudget {
  min_amount: number;
  max_amount: number;
  currency: string;
  is_flexible: boolean;
}

export interface AdvisoryPreferences {
  categories?: string[];
  brands?: string[];
  features?: string[];
  use_case?: string;
  experience_level?: "beginner" | "intermediate" | "advanced";
}

export interface AdvisoryRecommendation {
  product_id: string;
  product_name: string;
  price: number;
  reason: string;
  priority: number;
  alternatives?: string[];
}

export interface AdvisoryResponse {
  recommendations: AdvisoryRecommendation[];
  total_estimated_cost: number;
  notes?: string;
  advisor_id?: string;
  responded_at: Date;
}

export class AdvisoryRequest {
  constructor(
    public readonly id: string,
    public readonly user_id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly budget: AdvisoryBudget,
    public readonly preferences: AdvisoryPreferences = {},
    public readonly status: AdvisoryRequestStatus = AdvisoryRequestStatus.PENDING,
    public readonly priority: AdvisoryRequestPriority = AdvisoryRequestPriority.MEDIUM,
    public readonly response?: AdvisoryResponse,
    public readonly created_at: Date = new Date(),
    public readonly updated_at: Date = new Date(),
    public readonly deadline?: Date,
  ) {}

  public isActive(): boolean {
    return this.status !== AdvisoryRequestStatus.CANCELLED;
  }

  public isPending(): boolean {
    return this.status === AdvisoryRequestStatus.PENDING;
  }

  public isCompleted(): boolean {
    return this.status === AdvisoryRequestStatus.COMPLETED;
  }

  public hasResponse(): boolean {
    return this.response !== undefined;
  }

  public isOverdue(): boolean {
    if (!this.deadline) return false;
    return new Date() > this.deadline && !this.isCompleted();
  }

  public getBudgetRange(): string {
    return `${this.budget.min_amount} - ${this.budget.max_amount} ${this.budget.currency}`;
  }

  public getTotalRecommendedCost(): number {
    return this.response?.total_estimated_cost || 0;
  }

  public isWithinBudget(): boolean {
    if (!this.response) return true;
    return this.response.total_estimated_cost <= this.budget.max_amount;
  }
}
