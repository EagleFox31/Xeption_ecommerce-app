export class Brand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description?: string,
    public readonly logoUrl?: string,
    public readonly websiteUrl?: string,
    public readonly isActive: boolean = true,
    public readonly productCount: number = 0,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  public hasProducts(): boolean {
    return this.productCount > 0;
  }

  public canBeDeleted(): boolean {
    return !this.hasProducts();
  }

  /**
   * Génère un slug à partir du nom de la marque
   * Note: La génération se fait côté application car il n'y a pas de trigger SQL pour les slugs
   * Les triggers d'audit sont automatiquement appliqués via audit_brands_changes
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
}

export interface CreateBrandDto {
  name: string;
  slug?: string; // Optional, will be auto-generated if not provided
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive?: boolean;
}

export interface UpdateBrandDto {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive?: boolean;
}

export interface BrandFilters {
  isActive?: boolean;
  hasProducts?: boolean;
  search?: string;
}

export interface BrandListOptions {
  filters?: BrandFilters;
  includeProductCount?: boolean;
  sortBy?: "name" | "createdAt" | "productCount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface BrandListResult {
  brands: Brand[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
