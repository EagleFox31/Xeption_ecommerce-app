import { Injectable } from "@nestjs/common";
import { Product } from "../../domain/catalog/product.entity";
import {
  ProductRepositoryPort,
  ProductListOptions,
  ProductListResult,
  ProductFilters,
} from "../../domain/catalog/product.port";

@Injectable()
export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(options: ProductListOptions = {}): Promise<ProductListResult> {
    // Set default values
    const defaultOptions: ProductListOptions = {
      page: 1,
      limit: 20,
      sort_by: "created_at",
      sort_order: "desc",
      filters: {},
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      filters: {
        ...defaultOptions.filters,
        ...options.filters,
      },
    };

    // Validate pagination parameters
    if (mergedOptions.page! < 1) {
      mergedOptions.page = 1;
    }

    if (mergedOptions.limit! < 1 || mergedOptions.limit! > 100) {
      mergedOptions.limit = 20;
    }

    return await this.productRepository.findMany(mergedOptions);
  }

  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    if (limit < 1 || limit > 50) {
      limit = 10;
    }

    return await this.productRepository.findFeatured(limit);
  }

  async getProductsByCategory(
    categoryId: string,
    options: ProductListOptions = {},
  ): Promise<ProductListResult> {
    if (!categoryId || categoryId.trim() === "") {
      throw new Error("Category ID is required");
    }

    const defaultOptions: ProductListOptions = {
      page: 1,
      limit: 20,
      sort_by: "name",
      sort_order: "asc",
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
    };

    return await this.productRepository.findByCategory(
      categoryId,
      mergedOptions,
    );
  }

  async getProductsByBrand(
    brandId: string,
    options: ProductListOptions = {},
  ): Promise<ProductListResult> {
    if (!brandId || brandId.trim() === "") {
      throw new Error("Brand ID is required");
    }

    const defaultOptions: ProductListOptions = {
      page: 1,
      limit: 20,
      sort_by: "name",
      sort_order: "asc",
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
    };

    return await this.productRepository.findByBrand(brandId, mergedOptions);
  }

  async searchProducts(
    query: string,
    options: ProductListOptions = {},
  ): Promise<ProductListResult> {
    if (!query || query.trim() === "") {
      throw new Error("Search query is required");
    }

    const defaultOptions: ProductListOptions = {
      page: 1,
      limit: 20,
      sort_by: "name",
      sort_order: "asc",
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
    };

    return await this.productRepository.search(query.trim(), mergedOptions);
  }
}
