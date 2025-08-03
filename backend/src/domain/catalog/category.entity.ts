export interface CategoryParent {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryChild {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

export class Category {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly parentId?: string,
    public readonly parent?: CategoryParent,
    public readonly children: CategoryChild[] = [],
    public readonly skuPrefix: string = "",
    public readonly description?: string,
    public readonly imageUrl?: string,
    public readonly isActive: boolean = true,
    public readonly sortOrder: number = 0,
    public readonly productCount: number = 0,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  public isRootCategory(): boolean {
    return !this.parentId;
  }

  public hasChildren(): boolean {
    return this.children.length > 0;
  }

  public hasProducts(): boolean {
    return this.productCount > 0;
  }

  public getFullPath(): string {
    if (this.parent) {
      return `${this.parent.name} > ${this.name}`;
    }
    return this.name;
  }

  public canBeDeleted(): boolean {
    return !this.hasChildren() && !this.hasProducts();
  }

  public getLevel(): number {
    return this.parentId ? 1 : 0; // Simplified for now, could be recursive
  }

  /**
   * Génère un slug à partir du nom de la catégorie
   * Note: La génération se fait côté application car il n'y a pas de trigger SQL pour les slugs
   * Contrairement aux SKU qui sont gérés par les triggers assign_sku_from_category et get_next_sku
   */
  public static generateSlug(name: string, existingSlugs: string[] = []): string {
    let baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    // Handle uniqueness
    let slug = baseSlug;
    let counter = 1;
    while (existingSlugs.includes(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Génère un préfixe SKU à partir du nom de la catégorie
   * Note: Ce préfixe sera utilisé par les triggers SQL get_next_sku et assign_sku_from_category
   * pour générer automatiquement les SKU des produits
   */
  public static generateSkuPrefix(name: string, existingPrefixes: string[] = []): string {
    let basePrefix = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '') // Keep only alphanumeric
      .substring(0, 3); // Max 3 characters

    // Ensure minimum length
    if (basePrefix.length < 2) {
      basePrefix = basePrefix.padEnd(2, 'X');
    }

    // Handle uniqueness
    let prefix = basePrefix;
    let counter = 1;
    while (existingPrefixes.includes(prefix)) {
      prefix = `${basePrefix.substring(0, 2)}${counter}`;
      counter++;
    }

    return prefix;
  }
}

export interface CreateCategoryDto {
  name: string;
  slug?: string; // Optional, will be auto-generated if not provided
  parentId?: string;
  skuPrefix?: string; // Optional, will be auto-generated if not provided
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  parentId?: string;
  skuPrefix?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CategoryFilters {
  parentId?: string;
  isActive?: boolean;
  hasProducts?: boolean;
  search?: string;
}

export interface CategoryListOptions {
  filters?: CategoryFilters;
  includeChildren?: boolean;
  includeProductCount?: boolean;
  sortBy?: "name" | "sortOrder" | "createdAt" | "productCount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CategoryListResult {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
