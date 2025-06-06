import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { MarketingBannerRepositoryPort } from "../../../domain/marketing/banner.port";
import { MarketingBanner } from "../../../domain/marketing/banner.entity";

/**
 * Supabase Marketing Banner Repository
 * Implements banner data access using Supabase
 */
@Injectable()
export class SupabaseBannerRepository implements MarketingBannerRepositoryPort {
  private supabase: SupabaseClient;
  private readonly tableName = "marketing_banners";

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>("SUPABASE_URL"),
      this.configService.get<string>("SUPABASE_SERVICE_KEY"),
    );
  }

  async getActiveBanners(categoryId?: string): Promise<MarketingBanner[]> {
    let query = this.supabase
      .from(this.tableName)
      .select("*")
      .eq("active", true)
      .lte("start_date", new Date().toISOString())
      .gte("end_date", new Date().toISOString())
      .order("priority", { ascending: false });

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch active banners: ${error.message}`);
    }

    return data?.map((item) => new MarketingBanner(item)) || [];
  }

  async getAllBanners(): Promise<MarketingBanner[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch all banners: ${error.message}`);
    }

    return data?.map((item) => new MarketingBanner(item)) || [];
  }

  async getBannerById(id: string): Promise<MarketingBanner | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(`Failed to fetch banner: ${error.message}`);
    }

    return data ? new MarketingBanner(data) : null;
  }

  async createBanner(
    banner: Omit<MarketingBanner, "id" | "created_at" | "updated_at">,
  ): Promise<MarketingBanner> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...banner,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create banner: ${error.message}`);
    }

    return new MarketingBanner(data);
  }

  async updateBanner(
    id: string,
    updates: Partial<MarketingBanner>,
  ): Promise<MarketingBanner> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update banner: ${error.message}`);
    }

    return new MarketingBanner(data);
  }

  async toggleBannerStatus(
    id: string,
    active: boolean,
  ): Promise<MarketingBanner> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({
        active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to toggle banner status: ${error.message}`);
    }

    return new MarketingBanner(data);
  }

  async deleteBanner(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete banner: ${error.message}`);
    }
  }

  async getBannersByPriority(categoryId?: string): Promise<MarketingBanner[]> {
    let query = this.supabase
      .from(this.tableName)
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch banners by priority: ${error.message}`);
    }

    return data?.map((item) => new MarketingBanner(item)) || [];
  }
}
