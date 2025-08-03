import { Module } from "@nestjs/common";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { GetProductUseCase } from "../../application/catalog/get-product.use-case";
import { ListProductsUseCase } from "../../application/catalog/list-products.use-case";
import { PrismaProductRepository } from "../../infrastructure/prisma/repositories/product.repository";
import { PRODUCT_REPOSITORY } from "../../domain/catalog/product.port";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [CatalogController],
  providers: [
    CatalogService,
    GetProductUseCase,
    ListProductsUseCase,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
  ],
  exports: [CatalogService],
})
export class CatalogModule {}
