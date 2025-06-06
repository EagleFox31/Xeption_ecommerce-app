import { Module } from "@nestjs/common";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { GetProductUseCase } from "../../application/catalog/get-product.use-case";
import { ListProductsUseCase } from "../../application/catalog/list-products.use-case";
import { ProductRepository } from "../../infrastructure/supabase/repositories/product.repository";
import { ProductRepositoryPort } from "../../domain/catalog/product.port";

@Module({
  controllers: [CatalogController],
  providers: [
    CatalogService,
    GetProductUseCase,
    ListProductsUseCase,
    {
      provide: ProductRepositoryPort,
      useClass: ProductRepository,
    },
  ],
  exports: [CatalogService],
})
export class CatalogModule {}
