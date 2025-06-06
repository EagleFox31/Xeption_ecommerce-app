import { Product } from "./product.entity";

export interface ProductFilters {
  category_id?: string;
  brand_id?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  is_featured?: boolean;
  search?: string;
  tags?: string[];
}

export interface ProductListOptions {
  filters?: ProductFilters;
  sort_by?: "name" | "price" | "created_at" | "updated_at";
  sort_order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ProductListResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ProductRepositoryPort {
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findMany(options?: ProductListOptions): Promise<ProductListResult>;
  findFeatured(limit?: number): Promise<Product[]>;
  findByCategory(
    categoryId: string,
    options?: ProductListOptions,
  ): Promise<ProductListResult>;
  findByBrand(
    brandId: string,
    options?: ProductListOptions,
  ): Promise<ProductListResult>;
  search(
    query: string,
    options?: ProductListOptions,
  ): Promise<ProductListResult>;
}
