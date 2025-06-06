import { Test, TestingModule } from "@nestjs/testing";
import { CatalogController } from "../../modules/catalog/catalog.controller";
import { CatalogService } from "../../modules/catalog/catalog.service";
import {
  Product,
  ProductPrice,
  ProductCategory,
  ProductBrand,
} from "../../domain/catalog/product.entity";
import { ProductListResult } from "../../domain/catalog/product.port";

describe("CatalogController", () => {
  let controller: CatalogController;
  let catalogService: jest.Mocked<CatalogService>;

  const mockProduct = new Product(
    "1",
    "Test Product",
    "Test Description",
    "Short description",
    "TEST-001",
    { amount: 100, currency: "XAF" } as ProductPrice,
    { id: "1", name: "Electronics", slug: "electronics" } as ProductCategory,
    { id: "1", name: "Test Brand" } as ProductBrand,
    [],
    [],
    10,
    true,
    false,
  );

  const mockProductListResult: ProductListResult = {
    products: [mockProduct],
    total: 1,
    page: 1,
    limit: 20,
    total_pages: 1,
  };

  beforeEach(async () => {
    const mockCatalogService = {
      getProduct: jest.fn(),
      getProductBySku: jest.fn(),
      getProducts: jest.fn(),
      getFeaturedProducts: jest.fn(),
      getProductsByCategory: jest.fn(),
      getProductsByBrand: jest.fn(),
      searchProducts: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        {
          provide: CatalogService,
          useValue: mockCatalogService,
        },
      ],
    }).compile();

    controller = module.get<CatalogController>(CatalogController);
    catalogService = module.get(CatalogService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getProduct", () => {
    it("should return a product by ID", async () => {
      catalogService.getProduct.mockResolvedValue(mockProduct);

      const result = await controller.getProduct("1");

      expect(result).toEqual(mockProduct);
      expect(catalogService.getProduct).toHaveBeenCalledWith("1");
    });
  });

  describe("getProductBySku", () => {
    it("should return a product by SKU", async () => {
      catalogService.getProductBySku.mockResolvedValue(mockProduct);

      const result = await controller.getProductBySku("TEST-001");

      expect(result).toEqual(mockProduct);
      expect(catalogService.getProductBySku).toHaveBeenCalledWith("TEST-001");
    });
  });

  describe("getProducts", () => {
    it("should return a list of products with default parameters", async () => {
      catalogService.getProducts.mockResolvedValue(mockProductListResult);

      const result = await controller.getProducts(
        1,
        20,
        "created_at",
        "desc",
        {},
      );

      expect(result).toEqual(mockProductListResult);
      expect(catalogService.getProducts).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        sort_by: "created_at",
        sort_order: "desc",
        filters: {
          category_id: undefined,
          brand_id: undefined,
          min_price: undefined,
          max_price: undefined,
          in_stock: undefined,
          is_featured: undefined,
          search: undefined,
          tags: undefined,
        },
      });
    });

    it("should return a list of products with filters", async () => {
      catalogService.getProducts.mockResolvedValue(mockProductListResult);

      const queryParams = {
        category_id: "1",
        brand_id: "1",
        min_price: 50,
        max_price: 200,
        in_stock: true,
        search: "test",
        tags: "electronics,gadgets",
      };

      const result = await controller.getProducts(
        1,
        20,
        "name",
        "asc",
        queryParams,
      );

      expect(result).toEqual(mockProductListResult);
      expect(catalogService.getProducts).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        sort_by: "name",
        sort_order: "asc",
        filters: {
          category_id: "1",
          brand_id: "1",
          min_price: 50,
          max_price: 200,
          in_stock: true,
          is_featured: undefined,
          search: "test",
          tags: ["electronics", "gadgets"],
        },
      });
    });
  });

  describe("getFeaturedProducts", () => {
    it("should return featured products", async () => {
      catalogService.getFeaturedProducts.mockResolvedValue([mockProduct]);

      const result = await controller.getFeaturedProducts(10);

      expect(result).toEqual([mockProduct]);
      expect(catalogService.getFeaturedProducts).toHaveBeenCalledWith(10);
    });
  });

  describe("searchProducts", () => {
    it("should return search results", async () => {
      catalogService.searchProducts.mockResolvedValue(mockProductListResult);

      const result = await controller.searchProducts(
        "test",
        1,
        20,
        "name",
        "asc",
      );

      expect(result).toEqual(mockProductListResult);
      expect(catalogService.searchProducts).toHaveBeenCalledWith("test", {
        page: 1,
        limit: 20,
        sort_by: "name",
        sort_order: "asc",
      });
    });
  });

  describe("getProductsByCategory", () => {
    it("should return products by category", async () => {
      catalogService.getProductsByCategory.mockResolvedValue(
        mockProductListResult,
      );

      const result = await controller.getProductsByCategory(
        "1",
        1,
        20,
        "name",
        "asc",
      );

      expect(result).toEqual(mockProductListResult);
      expect(catalogService.getProductsByCategory).toHaveBeenCalledWith("1", {
        page: 1,
        limit: 20,
        sort_by: "name",
        sort_order: "asc",
      });
    });
  });

  describe("getProductsByBrand", () => {
    it("should return products by brand", async () => {
      catalogService.getProductsByBrand.mockResolvedValue(
        mockProductListResult,
      );

      const result = await controller.getProductsByBrand(
        "1",
        1,
        20,
        "name",
        "asc",
      );

      expect(result).toEqual(mockProductListResult);
      expect(catalogService.getProductsByBrand).toHaveBeenCalledWith("1", {
        page: 1,
        limit: 20,
        sort_by: "name",
        sort_order: "asc",
      });
    });
  });
});
