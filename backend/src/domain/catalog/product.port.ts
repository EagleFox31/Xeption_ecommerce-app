import { 
  Product, 
  CreateProductDto, 
  UpdateProductDto, 
  ProductFilters, 
  ProductListOptions, 
  ProductListResult 
} from "./product.entity";

/**
 * Injection token for ProductRepositoryPort
 */
export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';

/**
 * Interface pour les opérations bulk avec transaction
 */
export interface BulkOperationResult<T> {
  success: T[];
  failed: Array<{ data: any; error: string }>;
  totalProcessed: number;
}

export interface ProductRepositoryPort {
  // READ operations
  findById(id: string, options?: ProductListOptions): Promise<Product | null>;
  findBySlug(slug: string, options?: ProductListOptions): Promise<Product | null>;
  findBySku(sku: string, options?: ProductListOptions): Promise<Product | null>;
  findMany(options?: ProductListOptions): Promise<ProductListResult>;
  findByCategory(categoryId: string, options?: ProductListOptions): Promise<ProductListResult>;
  findByBrand(brandId: string, options?: ProductListOptions): Promise<ProductListResult>;
  findBySeries(seriesId: string, options?: ProductListOptions): Promise<ProductListResult>;
  findFeatured(options?: ProductListOptions): Promise<ProductListResult>;
  findOnSale(options?: ProductListOptions): Promise<ProductListResult>;
  search(query: string, options?: ProductListOptions): Promise<ProductListResult>;

  // CREATE operations
  create(data: CreateProductDto): Promise<Product>;
  
  /**
   * Création en lot avec transaction DB pour garantir la cohérence
   * Toutes les créations sont exécutées dans une seule transaction
   */
  createBulk(data: CreateProductDto[]): Promise<BulkOperationResult<Product>>;

  // UPDATE operations
  update(id: string, data: UpdateProductDto): Promise<Product>;
  updateStock(id: string, quantity: number): Promise<Product>;
  updatePrice(id: string, priceXaf: number, promoPriceXaf?: number): Promise<Product>;
  
  /**
   * Mise à jour en lot avec transaction DB pour garantir la cohérence
   * Toutes les mises à jour sont exécutées dans une seule transaction
   */
  updateBulk(updates: Array<{ id: string; data: UpdateProductDto }>): Promise<BulkOperationResult<Product>>;

  // DELETE operations
  delete(id: string): Promise<void>;
  
  /**
   * Suppression en lot avec transaction DB pour garantir la cohérence
   * Toutes les suppressions sont exécutées dans une seule transaction
   */
  deleteBulk(ids: string[]): Promise<BulkOperationResult<{ id: string }>>;
  
  softDelete(id: string): Promise<Product>; // Mark as inactive instead of deleting

  // UTILITY operations
  exists(id: string): Promise<boolean>;
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;
  existsBySku(sku: string, excludeId?: string): Promise<boolean>;
  count(filters?: ProductFilters): Promise<number>;
  
  // BASIC BUSINESS operations (les opérations complexes peuvent être déplacées vers des services dédiés)
  getRelatedProducts(productId: string, limit?: number): Promise<Product[]>;
}

/**
 * Interface pour les opérations business avancées
 * Ces méthodes pourraient être déplacées vers InventoryService ou AnalyticsService
 * mais sont gardées ici pour la commodité
 */
export interface ProductBusinessPort {
  getLowStockProducts(threshold?: number): Promise<Product[]>;
  getTopSellingProducts(limit?: number): Promise<Product[]>;
  getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]>;
  getProductsNeedingRestock(): Promise<Product[]>;
}

/**
 * Port principal qui combine les opérations de base et business
 */
export interface ProductPort extends ProductRepositoryPort, ProductBusinessPort {}
