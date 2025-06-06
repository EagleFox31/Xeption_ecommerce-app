import { Injectable, NotFoundException } from "@nestjs/common";
import { Product } from "../../domain/catalog/product.entity";
import { ProductRepositoryPort } from "../../domain/catalog/product.port";

@Injectable()
export class GetProductUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(productId: string): Promise<Product> {
    if (!productId || productId.trim() === "") {
      throw new NotFoundException("Product ID is required");
    }

    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (!product.is_active) {
      throw new NotFoundException(
        `Product with ID ${productId} is not available`,
      );
    }

    return product;
  }

  async executeBysku(sku: string): Promise<Product> {
    if (!sku || sku.trim() === "") {
      throw new NotFoundException("Product SKU is required");
    }

    const product = await this.productRepository.findBySku(sku);

    if (!product) {
      throw new NotFoundException(`Product with SKU ${sku} not found`);
    }

    if (!product.is_active) {
      throw new NotFoundException(`Product with SKU ${sku} is not available`);
    }

    return product;
  }
}
