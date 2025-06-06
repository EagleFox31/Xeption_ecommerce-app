import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  AdvisoryRequest,
  AdvisoryRequestStatus,
  AdvisoryRequestPriority,
  AdvisoryBudget,
  AdvisoryPreferences,
  AdvisoryResponse,
} from "../../../domain/advisory/advisory.entity";
import {
  AdvisoryRepositoryPort,
  CreateAdvisoryRequestData,
  UpdateAdvisoryRequestData,
  AdvisoryRequestListOptions,
  AdvisoryRequestListResult,
  AdvisoryRequestFilters,
} from "../../../domain/advisory/advisory.port";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class AdvisoryRepository implements AdvisoryRepositoryPort {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );
  }

  async create(data: CreateAdvisoryRequestData): Promise<AdvisoryRequest> {
    const id = uuidv4();
    const now = new Date();

    const insertData = {
      id,
      user_id: data.user_id,
      title: data.title,
      description: data.description,
      budget_min_amount: data.budget.min_amount,
      budget_max_amount: data.budget.max_amount,
      budget_currency: data.budget.currency,
      budget_is_flexible: data.budget.is_flexible,
      preferences: data.preferences || {},
      status: AdvisoryRequestStatus.PENDING,
      priority: AdvisoryRequestPriority.MEDIUM,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deadline: data.deadline?.toISOString(),
    };

    const { data: result, error } = await this.supabase
      .from("advisory_requests")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create advisory request: ${error.message}`);
    }

    return this.mapToAdvisoryRequest(result);
  }

  async findById(id: string): Promise<AdvisoryRequest | null> {
    const { data, error } = await this.supabase
      .from("advisory_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapToAdvisoryRequest(data);
  }

  async findByUserId(
    userId: string,
    options: AdvisoryRequestListOptions = {},
  ): Promise<AdvisoryRequestListResult> {
    const {
      filters = {},
      sort_by = "created_at",
      sort_order = "desc",
      page = 1,
      limit = 20,
    } = options;

    let query = this.supabase
      .from("advisory_requests")
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    // Apply filters
    query = this.applyFilters(query, filters);

    // Apply sorting
    const sortColumn = this.mapSortColumn(sort_by);
    query = query.order(sortColumn, { ascending: sort_order === "asc" });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch advisory requests: ${error.message}`);
    }

    const requests = data?.map((item) => this.mapToAdvisoryRequest(item)) || [];
    const total = count || 0;
    const total_pages = Math.ceil(total / limit);

    return {
      requests,
      total,
      page,
      limit,
      total_pages,
    };
  }

  async findMany(
    options: AdvisoryRequestListOptions = {},
  ): Promise<AdvisoryRequestListResult> {
    const {
      filters = {},
      sort_by = "created_at",
      sort_order = "desc",
      page = 1,
      limit = 20,
    } = options;

    let query = this.supabase
      .from("advisory_requests")
      .select("*", { count: "exact" });

    // Apply filters
    query = this.applyFilters(query, filters);

    // Apply sorting
    const sortColumn = this.mapSortColumn(sort_by);
    query = query.order(sortColumn, { ascending: sort_order === "asc" });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch advisory requests: ${error.message}`);
    }

    const requests = data?.map((item) => this.mapToAdvisoryRequest(item)) || [];
    const total = count || 0;
    const total_pages = Math.ceil(total / limit);

    return {
      requests,
      total,
      page,
      limit,
      total_pages,
    };
  }

  async update(
    id: string,
    data: UpdateAdvisoryRequestData,
  ): Promise<AdvisoryRequest> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.deadline !== undefined) {
      updateData.deadline = data.deadline?.toISOString();
    }

    if (data.budget) {
      if (data.budget.min_amount !== undefined) {
        updateData.budget_min_amount = data.budget.min_amount;
      }
      if (data.budget.max_amount !== undefined) {
        updateData.budget_max_amount = data.budget.max_amount;
      }
      if (data.budget.currency !== undefined) {
        updateData.budget_currency = data.budget.currency;
      }
      if (data.budget.is_flexible !== undefined) {
        updateData.budget_is_flexible = data.budget.is_flexible;
      }
    }

    if (data.preferences !== undefined) {
      updateData.preferences = data.preferences;
    }

    const { data: result, error } = await this.supabase
      .from("advisory_requests")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update advisory request: ${error.message}`);
    }

    return this.mapToAdvisoryRequest(result);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("advisory_requests")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete advisory request: ${error.message}`);
    }
  }

  async findPendingRequests(limit: number = 10): Promise<AdvisoryRequest[]> {
    const { data, error } = await this.supabase
      .from("advisory_requests")
      .select("*")
      .eq("status", AdvisoryRequestStatus.PENDING)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch pending requests: ${error.message}`);
    }

    return data?.map((item) => this.mapToAdvisoryRequest(item)) || [];
  }

  async findOverdueRequests(): Promise<AdvisoryRequest[]> {
    const now = new Date().toISOString();

    const { data, error } = await this.supabase
      .from("advisory_requests")
      .select("*")
      .lt("deadline", now)
      .neq("status", AdvisoryRequestStatus.COMPLETED)
      .neq("status", AdvisoryRequestStatus.CANCELLED)
      .order("deadline", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch overdue requests: ${error.message}`);
    }

    return data?.map((item) => this.mapToAdvisoryRequest(item)) || [];
  }

  private applyFilters(query: any, filters: AdvisoryRequestFilters) {
    if (filters.user_id) {
      query = query.eq("user_id", filters.user_id);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.min_budget !== undefined) {
      query = query.gte("budget_min_amount", filters.min_budget);
    }

    if (filters.max_budget !== undefined) {
      query = query.lte("budget_max_amount", filters.max_budget);
    }

    if (filters.has_response !== undefined) {
      if (filters.has_response) {
        query = query.not("response", "is", null);
      } else {
        query = query.is("response", null);
      }
    }

    if (filters.is_overdue !== undefined && filters.is_overdue) {
      const now = new Date().toISOString();
      query = query
        .lt("deadline", now)
        .neq("status", AdvisoryRequestStatus.COMPLETED)
        .neq("status", AdvisoryRequestStatus.CANCELLED);
    }

    if (filters.created_after) {
      query = query.gte("created_at", filters.created_after.toISOString());
    }

    if (filters.created_before) {
      query = query.lte("created_at", filters.created_before.toISOString());
    }

    return query;
  }

  private mapSortColumn(sortBy: string): string {
    const mapping: Record<string, string> = {
      created_at: "created_at",
      updated_at: "updated_at",
      deadline: "deadline",
      budget: "budget_max_amount",
    };
    return mapping[sortBy] || "created_at";
  }

  private mapToAdvisoryRequest(data: any): AdvisoryRequest {
    const budget: AdvisoryBudget = {
      min_amount: data.budget_min_amount || 0,
      max_amount: data.budget_max_amount || 0,
      currency: data.budget_currency || "XAF",
      is_flexible: data.budget_is_flexible || false,
    };

    const preferences: AdvisoryPreferences = data.preferences || {};

    const response: AdvisoryResponse | undefined = data.response
      ? {
          recommendations: data.response.recommendations || [],
          total_estimated_cost: data.response.total_estimated_cost || 0,
          notes: data.response.notes,
          advisor_id: data.response.advisor_id,
          responded_at: new Date(data.response.responded_at),
        }
      : undefined;

    return new AdvisoryRequest(
      data.id,
      data.user_id,
      data.title,
      data.description,
      budget,
      preferences,
      data.status || AdvisoryRequestStatus.PENDING,
      data.priority || AdvisoryRequestPriority.MEDIUM,
      response,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.deadline ? new Date(data.deadline) : undefined,
    );
  }
}
