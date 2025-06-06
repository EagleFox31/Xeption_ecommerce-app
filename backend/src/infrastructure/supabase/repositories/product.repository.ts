import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  Product,
  ProductSpecification,
  ProductImage,
  ProductCategory,
  ProductBrand,
  ProductPrice,
} from "../../../domain/catalog/product.entity";
import {
  ProductRepositoryPort,
  ProductListOptions,
  ProductListResult,
  ProductFilters,
} from "../../../domain/catalog/product.port";

@Injectable()
export class ProductRepository implements ProductRepositoryPort {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );
  }

  async findById(id: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from("products")
      .select(
        `
        *,
        categories:category_id(*),
        brands:brand_id(*),
        product_specifications(*),
        product_images(*)
      `,
      )
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapToProduct(data);
  }

  async findBySku(sku: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from("products")
      .select(
        `
        *,
        categories:category_id(*),
        brands:brand_id(*),
        product_specifications(*),
        product_images(*)
      `,
      )
      .eq("sku", sku)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapToProduct(data);
  }

  async findMany(options: ProductListOptions = {}): Promise<ProductListResult> {
    const {
      filters = {},
      sort_by = "created_at",
      sort_order = "desc",
      page = 1,
      limit = 20,
    } = options;

    let query = this.supabase
      .from("products")
      .select(
        `
        *,
        categories:category_id(*),
        brands:brand_id(*),
        product_specifications(*),
        product_images(*)
      `,
        { count: "exact" },
      )
      .eq("is_active", true);

    // Apply filters
    query = this.applyFilters(query, filters);

    // Apply sorting
    query = query.order(sort_by, { ascending: sort_order === "asc" });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    const products = data?.map((item) => this.mapToProduct(item)) || [];
    const total = count || 0;
    const total_pages = Math.ceil(total / limit);

    return {
      products,
      total,
      page,
      limit,
      total_pages,
    };
  }

  async findFeatured(limit: number = 10): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from("products")
      .select(
        `
        *,
        categories:category_id(*),
        brands:brand_id(*),
        product_specifications(*),
        product_images(*)
      `,
      )
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch featured products: ${error.message}`);
    }

    return data?.map((item) => this.mapToProduct(item)) || [];
  }

  async findByCategory(
    categoryId: string,
    options: ProductListOptions = {},
  ): Promise<ProductListResult> {
    const filtersWithCategory = {
      ...options.filters,
      category_id: categoryId,
    };

    return this.findMany({
      ...options,
      filters: filtersWithCategory,
    });
  }

  async findByBrand(
    brandId: string,
    options: ProductListOptions = {},
  ): Promise<ProductListResult> {
    const filtersWithBrand = {
      ...options.filters,
      brand_id: brandId,
    };

    return this.findMany({
      ...options,
      filters: filtersWithBrand,
    });
  }

  async search(
    query: string,
    options: ProductListOptions = {},
  ): Promise<ProductListResult> {
    const filtersWithSearch = {
      ...options.filters,
      search: query,
    };

    return this.findMany({
      ...options,
      filters: filtersWithSearch,
    });
  }

  private applyFilters(query: any, filters: ProductFilters) {
    if (filters.category_id) {
      query = query.eq("category_id", filters.category_id);
    }

    if (filters.brand_id) {
      query = query.eq("brand_id", filters.brand_id);
    }

    if (filters.min_price !== undefined) {
      query = query.gte("price_amount", filters.min_price);
    }

    if (filters.max_price !== undefined) {
      query = query.lte("price_amount", filters.max_price);
    }

    if (filters.in_stock !== undefined) {
      if (filters.in_stock) {
        query = query.gt("stock_quantity", 0);
      } else {
        query = query.eq("stock_quantity", 0);
      }
    }

    if (filters.is_featured !== undefined) {
      query = query.eq("is_featured", filters.is_featured);
    }

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`,
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps("tags", filters.tags);
    }

    return query;
  }

  private mapToProduct(data: any): Product {
    const specifications: ProductSpecification[] =
      data.product_specifications?.map((spec: any) => ({
        key: spec.key,
        value: spec.value,
        category: spec.category,
      })) || [];

    const images: ProductImage[] =
      data.product_images?.map((img: any) => ({
        id: img.id,
        url: img.url,
        alt_text: img.alt_text,
        is_primary: img.is_primary,
        order: img.order,
      })) || [];

    const category: ProductCategory | null = data.categories
      ? {
          id: data.categories.id,
          name: data.categories.name,
          slug: data.categories.slug,
          parent_id: data.categories.parent_id,
        }
      : null;

    const brand: ProductBrand | null = data.brands
      ? {
          id: data.brands.id,
          name: data.brands.name,
          logo_url: data.brands.logo_url,
        }
      : null;

    const price: ProductPrice = {
      amount: data.price_amount || 0,
      currency: data.price_currency || "XAF",
      discount_amount: data.discount_amount,
      discount_percentage: data.discount_percentage,
    };

    return new Product(
      data.id,
      data.name,
      data.description,
      data.short_description,
      data.sku,
      price,
      category,
      brand,
      specifications,
      images,
      data.stock_quantity,
      data.is_active,
      data.is_featured,
      data.weight,
      data.dimensions,
      data.tags || [],
      new Date(data.created_at),
      new Date(data.updated_at),
    );
  }
}
