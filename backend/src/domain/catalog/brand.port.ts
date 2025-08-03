import { 
  Brand, 
  CreateBrandDto, 
  UpdateBrandDto, 
  BrandFilters, 
  BrandListOptions, 
  BrandListResult 
} from "./brand.entity";

/**
 * Injection token for BrandRepositoryPort
 */
export const BRAND_REPOSITORY = 'BRAND_REPOSITORY';

/**
 * Interface pour les opérations bulk avec transaction
 */
export interface BulkOperationResult<T> {
  success: T[];
  failed: Array<{ data: any; error: string }>;
  totalProcessed: number;
}

export interface BrandRepositoryPort {
  // READ operations - Uniformisé avec findMany comme les autres domaines
  findById(id: string, options?: BrandListOptions): Promise<Brand | null>;
  findBySlug(slug: string, options?: BrandListOptions): Promise<Brand | null>;
  findMany(options?: BrandListOptions): Promise<BrandListResult>;
  findByCategory(categoryId: string, options?: BrandListOptions): Promise<BrandListResult>;
  search(query: string, options?: BrandListOptions): Promise<BrandListResult>;

  // CREATE operations
  create(data: CreateBrandDto): Promise<Brand>;
  
  /**
   * Création en lot avec transaction DB pour garantir la cohérence
   * Toutes les créations sont exécutées dans une seule transaction
   */
  createBulk(data: CreateBrandDto[]): Promise<BulkOperationResult<Brand>>;

  // UPDATE operations
  update(id: string, data: UpdateBrandDto): Promise<Brand>;
  
  /**
   * Mise à jour en lot avec transaction DB pour garantir la cohérence
   * Toutes les mises à jour sont exécutées dans une seule transaction
   */
  updateBulk(updates: Array<{ id: string; data: UpdateBrandDto }>): Promise<BulkOperationResult<Brand>>;

  // DELETE operations
  delete(id: string): Promise<void>;
  
  /**
   * Suppression en lot avec transaction DB pour garantir la cohérence
   * Toutes les suppressions sont exécutées dans une seule transaction
   */
  deleteBulk(ids: string[]): Promise<BulkOperationResult<{ id: string }>>;
  
  softDelete(id: string): Promise<Brand>; // Mark as inactive instead of deleting

  // UTILITY operations
  exists(id: string): Promise<boolean>;
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;
  count(filters?: BrandFilters): Promise<number>;
}

/**
 * Port principal pour les marques - Repository pur
 * Les opérations business (analytics, reporting) sont déplacées vers BrandAnalyticsService
 */
export interface BrandPort extends BrandRepositoryPort {}

/**
 * Service séparé pour les opérations business et analytics
 * À implémenter dans l'infrastructure comme BrandAnalyticsService
 */
export interface BrandAnalyticsPort {
  getBrandsWithProducts(): Promise<Brand[]>;
  getEmptyBrands(): Promise<Brand[]>;
  getBrandProductCount(brandId: string): Promise<number>;
  getPopularBrands(limit?: number): Promise<Brand[]>;
  getBrandSalesStats(brandId: string): Promise<{
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
  }>;
}

/**
 * Injection token for BrandAnalyticsPort
 */
export const BRAND_ANALYTICS_SERVICE = 'BRAND_ANALYTICS_SERVICE';
