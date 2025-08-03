import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { AdvisoryRepositoryPort, AdvisoryRequestListOptions, AdvisoryRequestListResult, CreateAdvisoryRequestData, UpdateAdvisoryRequestData } from "../../../domain/advisory/advisory.port";
import { AdvisoryRequest, AdvisoryRequestStatus, AdvisoryRequestPriority } from "../../../domain/advisory/advisory.entity";

@Injectable()
export class PrismaAdvisoryRepository implements AdvisoryRepositoryPort {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAdvisoryRequestData): Promise<AdvisoryRequest> {
    // Adapt the AdvisoryRequest data to use the BudgetAdvisory model
    const result = await this.prisma.budgetAdvisory.create({
      data: {
        userId: data.user_id,
        budgetXaf: data.budget.max_amount,
        usageContext: data.description,
        status: 'open',
        agentSuggestions: data.preferences || {},
      },
    });

    // Map the BudgetAdvisory model to AdvisoryRequest entity
    return this.mapBudgetAdvisoryToAdvisoryRequest(result, data);
  }

  async findById(id: string): Promise<AdvisoryRequest | null> {
    const advisory = await this.prisma.budgetAdvisory.findUnique({
      where: { id },
    });

    if (!advisory) return null;

    return this.mapBudgetAdvisoryToAdvisoryRequest(advisory);
  }

  async findByUserId(
    userId: string,
    options?: AdvisoryRequestListOptions
  ): Promise<AdvisoryRequestListResult> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };

    // Apply filters if provided
    if (options?.filters) {
      // Map status values from domain to BudgetStatusEnum
      if (options.filters.status) {
        where.status = this.mapDomainStatusToPrisma(options.filters.status);
      }
      
      // Min budget not directly supported but we can use gte on budgetXaf
      if (options.filters.min_budget) {
        where.budgetXaf = { gte: options.filters.min_budget };
      }
      
      // For created_at filters
      if (options.filters.created_after) {
        where.createdAt = { ...(where.createdAt || {}), gte: options.filters.created_after };
      }
      if (options.filters.created_before) {
        where.createdAt = { ...(where.createdAt || {}), lte: options.filters.created_before };
      }
    }

    // Determine ordering
    const orderBy: any = {};
    if (options?.sort_by) {
      const field = this.mapSortFieldToPrisma(options.sort_by);
      orderBy[field] = options.sort_order === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Get total count and advisories
    const [total, advisories] = await Promise.all([
      this.prisma.budgetAdvisory.count({ where }),
      this.prisma.budgetAdvisory.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      requests: advisories.map(advisory => this.mapBudgetAdvisoryToAdvisoryRequest(advisory)),
      total,
      page,
      limit,
      total_pages: totalPages,
    };
  }

  async findMany(options?: AdvisoryRequestListOptions): Promise<AdvisoryRequestListResult> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Apply filters if provided
    if (options?.filters) {
      if (options.filters.user_id) {
        where.userId = options.filters.user_id;
      }
      
      // Map status values from domain to BudgetStatusEnum
      if (options.filters.status) {
        where.status = this.mapDomainStatusToPrisma(options.filters.status);
      }
      
      // Min budget not directly supported but we can use gte on budgetXaf
      if (options.filters.min_budget) {
        where.budgetXaf = { gte: options.filters.min_budget };
      }
      
      // For created_at filters
      if (options.filters.created_after) {
        where.createdAt = { ...(where.createdAt || {}), gte: options.filters.created_after };
      }
      if (options.filters.created_before) {
        where.createdAt = { ...(where.createdAt || {}), lte: options.filters.created_before };
      }
    }

    // Determine ordering
    const orderBy: any = {};
    if (options?.sort_by) {
      const field = this.mapSortFieldToPrisma(options.sort_by);
      orderBy[field] = options.sort_order === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Get total count and advisories
    const [total, advisories] = await Promise.all([
      this.prisma.budgetAdvisory.count({ where }),
      this.prisma.budgetAdvisory.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      requests: advisories.map(advisory => this.mapBudgetAdvisoryToAdvisoryRequest(advisory)),
      total,
      page,
      limit,
      total_pages: totalPages,
    };
  }

  async update(id: string, data: UpdateAdvisoryRequestData): Promise<AdvisoryRequest> {
    const updateData: any = {};

    // Map domain entity fields to BudgetAdvisory fields
    if (data.description !== undefined) updateData.usageContext = data.description;
    
    // Map status if provided (from domain enum to DB enum)
    if (data.status !== undefined) {
      updateData.status = this.mapDomainStatusToPrisma(data.status);
    }
    
    // Update budget if provided
    if (data.budget?.max_amount !== undefined) {
      updateData.budgetXaf = data.budget.max_amount;
    }
    
    // Update preferences as agent suggestions if provided
    if (data.preferences) {
      updateData.agentSuggestions = data.preferences;
    }

    const updated = await this.prisma.budgetAdvisory.update({
      where: { id },
      data: updateData,
    });

    return this.mapBudgetAdvisoryToAdvisoryRequest(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.budgetAdvisory.delete({
      where: { id },
    });
  }

  async findPendingRequests(limit?: number): Promise<AdvisoryRequest[]> {
    const advisories = await this.prisma.budgetAdvisory.findMany({
      where: { status: 'open' }, // 'open' in BudgetStatusEnum corresponds to 'pending' in AdvisoryRequestStatus
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return advisories.map(advisory => this.mapBudgetAdvisoryToAdvisoryRequest(advisory));
  }

  async findOverdueRequests(): Promise<AdvisoryRequest[]> {
    // Note: BudgetAdvisory doesn't have a deadline field, so we can't implement this directly
    // Return empty array as a fallback
    return [];
  }

  // Helper methods
  private mapBudgetAdvisoryToAdvisoryRequest(data: any, originalData?: Partial<CreateAdvisoryRequestData>): AdvisoryRequest {
    // Extract preferences from agentSuggestions
    let preferences = data.agentSuggestions || {};
    
    // Create an AdvisoryRequest entity from BudgetAdvisory data
    return new AdvisoryRequest(
      data.id,
      data.userId,
      originalData?.title || "Budget Advisory", // Default title if not provided
      data.usageContext || "",
      {
        min_amount: Number(data.budgetXaf) * 0.8, // Estimate min_amount as 80% of budgetXaf
        max_amount: Number(data.budgetXaf),
        currency: 'XAF',
        is_flexible: true, // Default to flexible since we don't have this info
      },
      preferences,
      this.mapPrismaStatusToDomain(data.status),
      AdvisoryRequestPriority.MEDIUM, // Default priority
      undefined, // No response data in BudgetAdvisory
      data.createdAt,
      data.createdAt, // No updatedAt in BudgetAdvisory
      undefined // No deadline in BudgetAdvisory
    );
  }

  private mapPrismaStatusToDomain(status: string): AdvisoryRequestStatus {
    // Map BudgetStatusEnum values to AdvisoryRequestStatus
    const statusMap: Record<string, AdvisoryRequestStatus> = {
      'open': AdvisoryRequestStatus.PENDING,
      'in_consult': AdvisoryRequestStatus.IN_PROGRESS,
      'closed': AdvisoryRequestStatus.COMPLETED,
    };
    
    return statusMap[status] || AdvisoryRequestStatus.PENDING;
  }
  
  private mapDomainStatusToPrisma(status: AdvisoryRequestStatus): string {
    // Map AdvisoryRequestStatus to BudgetStatusEnum
    const statusMap: Record<AdvisoryRequestStatus, string> = {
      [AdvisoryRequestStatus.PENDING]: 'open',
      [AdvisoryRequestStatus.IN_PROGRESS]: 'in_consult',
      [AdvisoryRequestStatus.COMPLETED]: 'closed',
      [AdvisoryRequestStatus.CANCELLED]: 'closed', // Map cancelled to closed as fallback
    };
    
    return statusMap[status] || 'open';
  }

  private mapSortFieldToPrisma(field: string): string {
    // Map domain sort fields to BudgetAdvisory fields
    const fieldMap: Record<string, string> = {
      'created_at': 'createdAt',
      'budget': 'budgetXaf',
    };
    
    return fieldMap[field] || 'createdAt';
  }
}