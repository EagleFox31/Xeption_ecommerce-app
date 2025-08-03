import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import {
  Product,
  ProductSpecification,
  ProductImage,
  ProductCategory,
  ProductBrand,
  ProductPrice,
} from "../../../domain/catalog/product.entity";
import {
  ProductRepositoryPort,
  ProductListOptions,
  ProductListResult,
  ProductFilters,
} from "../../../domain/catalog/product.port";

@Injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Product | null> {
    // In the Prisma schema, product ID is BigInt
    const productId = BigInt(id);
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        brand: true,
        images: true,
        specifications: true,
        descriptions: true,
        features: true,
        series: true,
      },
    });

    if (!product) {
      return null;
    }

    return this.mapToProduct(product);
  }

  async findBySku(sku: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
        brand: true,
        images: true,
        specifications: true,
        descriptions: true,
        features: true,
        series: true,
      },
    });

    if (!product) {
      return null;
    }

    return this.mapToProduct(product);
  }

  async findMany(options: ProductListOptions = {}): Promise<ProductListResult> {
    const {
      filters = {},
      sort_by = "created_at",
      sort_order = "desc",
      page = 1,
      limit = 20,
    } = options;

    // Build where conditions
    const where = this.buildWhereConditions(filters);

    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Map sort_by field to Prisma schema field names
    let orderBy: any;
    switch (sort_by) {
      case "name":
        orderBy = { name: sort_order };
        break;
      case "price":
        orderBy = { priceXaf: sort_order };
        break;
      case "created_at":
        orderBy = { createdAt: sort_order };
        break;
      case "updated_at":
        orderBy = { updatedAt: sort_order };
        break;
      default:
        orderBy = { createdAt: sort_order };
    }

    // Get products with count
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          images: true,
          specifications: true,
          features: true,
          descriptions: true,
          series: true,
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);

    // Calculate total pages
    const total_pages = Math.ceil(total / limit);

    // Map to domain entities
    const mappedProducts = products.map(product => this.mapToProduct(product));

    return {
      products: mappedProducts,
      total,
      page,
      limit,
      total_pages,
    };
  }

  async findFeatured(limit: number = 10): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          // Premium or Pro tier products
          { tier: 'premium' },
          { tier: 'pro' },
          // Products with promotions
          {
            promoPct: {
              gt: 0
            }
          }
        ],
        // Only include products in stock
        stockQty: {
          gt: 0
        }
      },
      include: {
        category: true,
        brand: true,
        images: true,
        specifications: true,
        features: true,
        descriptions: true,
        series: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return products.map(product => this.mapToProduct(product));
  }

  async findByCategory(
    categoryId: string,
    options: ProductListOptions = {},
  ): Promise<ProductListResult> {
    const filtersWithCategory = {
      ...options.filters,
      category_id: categoryId, // This gets converted in buildWhereConditions
    };

    return this.findMany({
      ...options,
      filters: filtersWithCategory,
    });
  }

  async findByBrand(
    brandId: string,
    options: ProductListOptions = {},
  ): Promise<ProductListResult> {
    const filtersWithBrand = {
      ...options.filters,
      brand_id: brandId, // This gets converted in buildWhereConditions
    };

    return this.findMany({
      ...options,
      filters: filtersWithBrand,
    });
  }

  async search(
    query: string,
    options: ProductListOptions = {},
  ): Promise<ProductListResult> {
    const filtersWithSearch = {
      ...options.filters,
      search: query,
    };

    return this.findMany({
      ...options,
      filters: filtersWithSearch,
    });
  }

  private buildWhereConditions(filters: ProductFilters) {
    // Initialize an empty where condition
    const where: any = {};

    // Map category_id from string to BigInt if provided
    if (filters.category_id) {
      where.categoryId = BigInt(filters.category_id);
    }

    // Map brand_id from string to BigInt if provided
    if (filters.brand_id) {
      where.brandId = BigInt(filters.brand_id);
    }

    // Handle price filters using priceXaf field (as per schema)
    if (filters.min_price !== undefined) {
      where.priceXaf = {
        ...where.priceXaf,
        gte: filters.min_price,
      };
    }

    if (filters.max_price !== undefined) {
      where.priceXaf = {
        ...where.priceXaf,
        lte: filters.max_price,
      };
    }

    // Handle in_stock filter using stockQty field (as per schema)
    if (filters.in_stock !== undefined) {
      if (filters.in_stock) {
        where.stockQty = {
          gt: 0,
        };
      } else {
        where.stockQty = 0;
      }
    }

    // Handle is_featured filter using tier or promoPct as a proxy
    if (filters.is_featured !== undefined && filters.is_featured) {
      where.OR = [
        { tier: 'premium' },
        { tier: 'pro' },
        { promoPct: { gt: 0 } }
      ];
    }

    // Handle search filter with case-insensitive search
    if (filters.search) {
      const searchConditions = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { sku: { contains: filters.search, mode: "insensitive" } },
        {
          descriptions: {
            some: {
              content: { contains: filters.search, mode: "insensitive" }
            }
          }
        },
        // Also search in features
        {
          features: {
            some: {
              value: { contains: filters.search, mode: "insensitive" }
            }
          }
        }
      ];
      
      if (where.OR) {
        where.OR = [...where.OR, ...searchConditions];
      } else {
        where.OR = searchConditions;
      }
    }

    // No tags field in schema, so we'll skip that filter
    
    return where;
  }

  private mapToProduct(data: any): Product {
    // Map specifications from the Prisma model
    const specifications: ProductSpecification[] =
      data.specifications?.map((spec: any) => ({
        key: spec.key,
        value: spec.value,
        category: spec.category || 'general',
      })) || [];

    // Map images from the Prisma model
    const images: ProductImage[] =
      data.images?.map((img: any) => ({
        id: img.id.toString(),
        url: img.url,
        alt_text: img.altText || '',
        is_primary: img.isPrimary || false,
        order: img.order || 0,
      })) || [];

    // Map category from the Prisma model
    const category: ProductCategory | null = data.category
      ? {
          id: data.category.id.toString(),
          name: data.category.name,
          slug: data.category.slug,
          parent_id: data.category.parentId ? data.category.parentId.toString() : null,
        }
      : null;

    // Map brand from the Prisma model
    const brand: ProductBrand | null = data.brand
      ? {
          id: data.brand.id.toString(),
          name: data.brand.name,
          logo_url: data.brand.logoUrl || null,
        }
      : null;

    // Extract description and short description from descriptions array if available
    let description = '';
    let shortDescription = '';
    
    if (data.descriptions && data.descriptions.length > 0) {
      // Find main description
      const mainDesc = data.descriptions.find((desc: any) => desc.type === 'main');
      if (mainDesc) {
        description = mainDesc.content;
      }
      
      // Find short description
      const shortDesc = data.descriptions.find((desc: any) => desc.type === 'short');
      if (shortDesc) {
        shortDescription = shortDesc.content;
      }
    }

    // Map price information
    const price: ProductPrice = {
      amount: data.priceXaf || 0,
      currency: "XAF", // Default currency
      discount_amount: data.promoPct ? Math.round(data.priceXaf * (data.promoPct / 100)) : 0,
      discount_percentage: data.promoPct || 0,
    };

    // Determine if product is featured based on tier or promotion
    const isFeatured = data.tier === 'premium' || data.tier === 'pro' || (data.promoPct && data.promoPct > 0);

    // Create and return the Product domain entity
    return new Product(
      data.id.toString(),
      data.name,
      description || data.description || '', // Use extracted description or fallback
      shortDescription || '', // Use extracted short description
      data.sku,
      price,
      category,
      brand,
      specifications,
      images,
      data.stockQty || 0,
      data.status === 'active', // Map status to isActive
      isFeatured,
      data.weight || null,
      data.dimensions || null,
      data.tags || [],
      data.createdAt,
      data.updatedAt,
    );
  }
}