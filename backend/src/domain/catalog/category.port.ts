import { 
  Category, 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  CategoryFilters, 
  CategoryListOptions, 
  CategoryListResult 
} from "./category.entity";

/**
 * Injection token for CategoryRepositoryPort
 */
export const CATEGORY_REPOSITORY = 'CATEGORY_REPOSITORY';

/**
 * Interface pour les opérations bulk avec transaction
 */
export interface BulkOperationResult<T> {
  success: T[];
  failed: Array<{ data: any; error: string }>;
  totalProcessed: number;
}

export interface CategoryRepositoryPort {
  // READ operations
  findById(id: string, options?: CategoryListOptions): Promise<Category | null>;
  findBySlug(slug: string, options?: CategoryListOptions): Promise<Category | null>;
  findAll(options?: CategoryListOptions): Promise<CategoryListResult>;
  findRootCategories(options?: CategoryListOptions): Promise<CategoryListResult>;
  findByParent(parentId: string, options?: CategoryListOptions): Promise<CategoryListResult>;
  findWithChildren(id: string, options?: CategoryListOptions): Promise<Category | null>;
  search(query: string, options?: CategoryListOptions): Promise<CategoryListResult>;

  // CREATE operations
  create(data: CreateCategoryDto): Promise<Category>;
  
  /**
   * Création en lot avec transaction DB pour garantir la cohérence
   * Toutes les créations sont exécutées dans une seule transaction
   */
  createBulk(data: CreateCategoryDto[]): Promise<BulkOperationResult<Category>>;

  // UPDATE operations
  update(id: string, data: UpdateCategoryDto): Promise<Category>;
  
  /**
   * Mise à jour en lot avec transaction DB pour garantir la cohérence
   * Toutes les mises à jour sont exécutées dans une seule transaction
   */
  updateBulk(updates: Array<{ id: string; data: UpdateCategoryDto }>): Promise<BulkOperationResult<Category>>;

  // DELETE operations
  delete(id: string): Promise<void>;
  
  /**
   * Suppression en lot avec transaction DB pour garantir la cohérence
   * Toutes les suppressions sont exécutées dans une seule transaction
   */
  deleteBulk(ids: string[]): Promise<BulkOperationResult<{ id: string }>>;
  
  softDelete(id: string): Promise<Category>; // Mark as inactive instead of deleting

  // UTILITY operations
  exists(id: string): Promise<boolean>;
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;
  existsBySkuPrefix(skuPrefix: string, excludeId?: string): Promise<boolean>;
  count(filters?: CategoryFilters): Promise<number>;
  
  // HIERARCHY operations
  getAncestors(categoryId: string): Promise<Category[]>;
  getDescendants(categoryId: string): Promise<Category[]>;
  getCategoryTree(): Promise<Category[]>;
  moveCategory(categoryId: string, newParentId?: string): Promise<Category>;
  
  // BUSINESS operations
  getCategoriesWithProducts(): Promise<Category[]>;
  getEmptyCategories(): Promise<Category[]>;
  getCategoryProductCount(categoryId: string): Promise<number>;
}

/**
 * Port principal pour les catégories
 */
export interface CategoryPort extends CategoryRepositoryPort {}
