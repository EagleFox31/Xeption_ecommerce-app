export interface ProductSpecification {
  key: string;
  value: string;
  category: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  order: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
}

export interface ProductBrand {
  id: string;
  name: string;
  logo_url?: string;
}

export interface ProductPrice {
  amount: number;
  currency: string;
  discount_amount?: number;
  discount_percentage?: number;
}

export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly short_description?: string,
    public readonly sku: string = "",
    public readonly price: ProductPrice = { amount: 0, currency: "XAF" },
    public readonly category: ProductCategory | null = null,
    public readonly brand: ProductBrand | null = null,
    public readonly specifications: ProductSpecification[] = [],
    public readonly images: ProductImage[] = [],
    public readonly stock_quantity: number = 0,
    public readonly is_active: boolean = true,
    public readonly is_featured: boolean = false,
    public readonly weight?: number,
    public readonly dimensions?: string,
    public readonly tags: string[] = [],
    public readonly created_at: Date = new Date(),
    public readonly updated_at: Date = new Date(),
  ) {}

  public isInStock(): boolean {
    return this.stock_quantity > 0;
  }

  public hasDiscount(): boolean {
    return (
      this.price.discount_amount !== undefined && this.price.discount_amount > 0
    );
  }

  public getFinalPrice(): number {
    if (this.hasDiscount()) {
      return this.price.amount - (this.price.discount_amount || 0);
    }
    return this.price.amount;
  }

  public getPrimaryImage(): ProductImage | null {
    return this.images.find((img) => img.is_primary) || this.images[0] || null;
  }

  public getSpecificationsByCategory(category: string): ProductSpecification[] {
    return this.specifications.filter((spec) => spec.category === category);
  }
}
