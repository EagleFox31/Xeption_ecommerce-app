import { AdvisoryRequest, AdvisoryRequestStatus } from "./advisory.entity";

/**
 * Injection token for AdvisoryRepositoryPort
 */
export const ADVISORY_REPOSITORY = 'ADVISORY_REPOSITORY';

export interface AdvisoryRequestFilters {
  user_id?: string;
  status?: AdvisoryRequestStatus;
  min_budget?: number;
  max_budget?: number;
  has_response?: boolean;
  is_overdue?: boolean;
  created_after?: Date;
  created_before?: Date;
}

export interface AdvisoryRequestListOptions {
  filters?: AdvisoryRequestFilters;
  sort_by?: "created_at" | "updated_at" | "deadline" | "budget";
  sort_order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface AdvisoryRequestListResult {
  requests: AdvisoryRequest[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CreateAdvisoryRequestData {
  user_id: string;
  title: string;
  description: string;
  budget: {
    min_amount: number;
    max_amount: number;
    currency: string;
    is_flexible: boolean;
  };
  preferences?: {
    categories?: string[];
    brands?: string[];
    features?: string[];
    use_case?: string;
    experience_level?: "beginner" | "intermediate" | "advanced";
  };
  deadline?: Date;
}

export interface UpdateAdvisoryRequestData {
  title?: string;
  description?: string;
  budget?: {
    min_amount?: number;
    max_amount?: number;
    currency?: string;
    is_flexible?: boolean;
  };
  preferences?: {
    categories?: string[];
    brands?: string[];
    features?: string[];
    use_case?: string;
    experience_level?: "beginner" | "intermediate" | "advanced";
  };
  status?: AdvisoryRequestStatus;
  deadline?: Date;
}

export interface AdvisoryRepositoryPort {
  create(data: CreateAdvisoryRequestData): Promise<AdvisoryRequest>;
  findById(id: string): Promise<AdvisoryRequest | null>;
  findByUserId(
    userId: string,
    options?: AdvisoryRequestListOptions,
  ): Promise<AdvisoryRequestListResult>;
  findMany(
    options?: AdvisoryRequestListOptions,
  ): Promise<AdvisoryRequestListResult>;
  update(id: string, data: UpdateAdvisoryRequestData): Promise<AdvisoryRequest>;
  delete(id: string): Promise<void>;
  findPendingRequests(limit?: number): Promise<AdvisoryRequest[]>;
  findOverdueRequests(): Promise<AdvisoryRequest[]>;
}
