import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { CatalogService } from "./catalog.service";
import { Product } from "../../domain/catalog/product.entity";
import {
  ProductListResult,
  ProductFilters,
} from "../../domain/catalog/product.port";

interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort_by?: "name" | "price" | "created_at" | "updated_at";
  sort_order?: "asc" | "desc";
  category_id?: string;
  brand_id?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  is_featured?: boolean;
  search?: string;
  tags?: string;
}

@Controller("catalog")
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get("products")
  async getProducts(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query("sort_by", new DefaultValuePipe("created_at"))
    sort_by: "name" | "price" | "created_at" | "updated_at",
    @Query("sort_order", new DefaultValuePipe("desc"))
    sort_order: "asc" | "desc",
    @Query() query: ProductQueryParams,
  ): Promise<ProductListResult> {
    const filters: ProductFilters = {
      category_id: query.category_id,
      brand_id: query.brand_id,
      min_price: query.min_price,
      max_price: query.max_price,
      in_stock: query.in_stock,
      is_featured: query.is_featured,
      search: query.search,
      tags: query.tags
        ? query.tags.split(",").map((tag) => tag.trim())
        : undefined,
    };

    return this.catalogService.getProducts({
      page,
      limit,
      sort_by,
      sort_order,
      filters,
    });
  }

  @Get("products/featured")
  async getFeaturedProducts(
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<Product[]> {
    return this.catalogService.getFeaturedProducts(limit);
  }

  @Get("products/search")
  async searchProducts(
    @Query("q") query: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query("sort_by", new DefaultValuePipe("name"))
    sort_by: "name" | "price" | "created_at" | "updated_at",
    @Query("sort_order", new DefaultValuePipe("asc"))
    sort_order: "asc" | "desc",
  ): Promise<ProductListResult> {
    return this.catalogService.searchProducts(query, {
      page,
      limit,
      sort_by,
      sort_order,
    });
  }

  @Get("products/category/:categoryId")
  async getProductsByCategory(
    @Param("categoryId") categoryId: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query("sort_by", new DefaultValuePipe("name"))
    sort_by: "name" | "price" | "created_at" | "updated_at",
    @Query("sort_order", new DefaultValuePipe("asc"))
    sort_order: "asc" | "desc",
  ): Promise<ProductListResult> {
    return this.catalogService.getProductsByCategory(categoryId, {
      page,
      limit,
      sort_by,
      sort_order,
    });
  }

  @Get("products/brand/:brandId")
  async getProductsByBrand(
    @Param("brandId") brandId: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query("sort_by", new DefaultValuePipe("name"))
    sort_by: "name" | "price" | "created_at" | "updated_at",
    @Query("sort_order", new DefaultValuePipe("asc"))
    sort_order: "asc" | "desc",
  ): Promise<ProductListResult> {
    return this.catalogService.getProductsByBrand(brandId, {
      page,
      limit,
      sort_by,
      sort_order,
    });
  }

  @Get("products/:id")
  async getProduct(@Param("id") id: string): Promise<Product> {
    return this.catalogService.getProduct(id);
  }

  @Get("products/sku/:sku")
  async getProductBySku(@Param("sku") sku: string): Promise<Product> {
    return this.catalogService.getProductBySku(sku);
  }
}
