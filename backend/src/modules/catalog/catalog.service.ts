import { Injectable } from "@nestjs/common";
import { GetProductUseCase } from "../../application/catalog/get-product.use-case";
import { ListProductsUseCase } from "../../application/catalog/list-products.use-case";
import { Product } from "../../domain/catalog/product.entity";
import {
  ProductListOptions,
  ProductListResult,
} from "../../domain/catalog/product.port";

@Injectable()
export class CatalogService {
  constructor(
    private readonly getProductUseCase: GetProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
  ) {}

  async getProduct(id: string): Promise<Product> {
    return this.getProductUseCase.execute(id);
  }

  async getProductBySku(sku: string): Promise<Product> {
    return this.getProductUseCase.executeBysku(sku);
  }

  async getProducts(options?: ProductListOptions): Promise<ProductListResult> {
    return this.listProductsUseCase.execute(options);
  }

  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    return this.listProductsUseCase.getFeaturedProducts(limit);
  }

  async getProductsByCategory(
    categoryId: string,
    options?: ProductListOptions,
  ): Promise<ProductListResult> {
    return this.listProductsUseCase.getProductsByCategory(categoryId, options);
  }

  async getProductsByBrand(
    brandId: string,
    options?: ProductListOptions,
  ): Promise<ProductListResult> {
    return this.listProductsUseCase.getProductsByBrand(brandId, options);
  }

  async searchProducts(
    query: string,
    options?: ProductListOptions,
  ): Promise<ProductListResult> {
    return this.listProductsUseCase.searchProducts(query, options);
  }
}
