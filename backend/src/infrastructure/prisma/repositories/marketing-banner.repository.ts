import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { MarketingBanner } from "../../../domain/marketing/banner.entity";
import { MarketingBannerRepositoryPort } from "../../../domain/marketing/banner.port";

@Injectable()
export class PrismaMarketingBannerRepository implements MarketingBannerRepositoryPort {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all active banners, optionally filtered by category
   */
  async getActiveBanners(categoryId?: string): Promise<MarketingBanner[]> {
    const now = new Date();
    
    const where: any = {
      active: true,
      startDate: { lte: now },
      endDate: { gte: now },
    };

    if (categoryId) {
      where.categoryId = BigInt(categoryId);
    }

    const banners = await this.prisma.marketingBanner.findMany({
      where,
      orderBy: {
        priority: 'desc'
      },
      include: {
        category: true
      }
    });

    return banners.map(banner => this.mapPrismaToMarketingBanner(banner));
  }

  /**
   * Get all banners (admin view)
   */
  async getAllBanners(): Promise<MarketingBanner[]> {
    const banners = await this.prisma.marketingBanner.findMany({
      orderBy: [
        { priority: 'desc' },
        { startDate: 'desc' }
      ],
      include: {
        category: true
      }
    });

    return banners.map(banner => this.mapPrismaToMarketingBanner(banner));
  }

  /**
   * Get banner by ID
   */
  async getBannerById(id: string): Promise<MarketingBanner | null> {
    const banner = await this.prisma.marketingBanner.findUnique({
      where: { id: BigInt(id) },
      include: {
        category: true
      }
    });

    if (!banner) {
      return null;
    }

    return this.mapPrismaToMarketingBanner(banner);
  }

  /**
   * Create a new banner
   */
  async createBanner(
    banner: Omit<MarketingBanner, "id" | "created_at" | "updated_at">
  ): Promise<MarketingBanner> {
    // Mapper le modèle de domaine vers le modèle Prisma
    const newBanner = await this.prisma.marketingBanner.create({
      data: {
        title237: banner.title_237,
        imageUrl: banner.image_url,
        ctaUrl: banner.cta_url,
        categoryId: banner.category_id ? BigInt(banner.category_id) : null,
        priority: banner.priority,
        startDate: banner.start_date,
        endDate: banner.end_date,
        active: banner.active
      },
      include: {
        category: true
      }
    });

    return this.mapPrismaToMarketingBanner(newBanner);
  }

  /**
   * Update an existing banner
   */
  async updateBanner(
    id: string,
    updates: Partial<MarketingBanner>
  ): Promise<MarketingBanner> {
    const data: any = {};

    if (updates.title_237 !== undefined) {
      data.title237 = updates.title_237;
    }

    if (updates.description_237 !== undefined) {
      // Note: Le champ description_237 n'est pas présent dans le schéma Prisma
      // On l'ignore pour l'instant
    }

    if (updates.image_url !== undefined) {
      data.imageUrl = updates.image_url;
    }

    if (updates.cta_url !== undefined) {
      data.ctaUrl = updates.cta_url;
    }

    if (updates.category_id !== undefined) {
      data.categoryId = updates.category_id ? BigInt(updates.category_id) : null;
    }

    if (updates.priority !== undefined) {
      data.priority = updates.priority;
    }

    if (updates.start_date !== undefined) {
      data.startDate = updates.start_date;
    }

    if (updates.end_date !== undefined) {
      data.endDate = updates.end_date;
    }

    if (updates.active !== undefined) {
      data.active = updates.active;
    }

    const updatedBanner = await this.prisma.marketingBanner.update({
      where: { id: BigInt(id) },
      data,
      include: {
        category: true
      }
    });

    return this.mapPrismaToMarketingBanner(updatedBanner);
  }

  /**
   * Toggle banner active status
   */
  async toggleBannerStatus(id: string, active: boolean): Promise<MarketingBanner> {
    const updatedBanner = await this.prisma.marketingBanner.update({
      where: { id: BigInt(id) },
      data: { active },
      include: {
        category: true
      }
    });

    return this.mapPrismaToMarketingBanner(updatedBanner);
  }

  /**
   * Delete a banner
   */
  async deleteBanner(id: string): Promise<void> {
    await this.prisma.marketingBanner.delete({
      where: { id: BigInt(id) }
    });
  }

  /**
   * Get banners by priority (for ordering)
   */
  async getBannersByPriority(categoryId?: string): Promise<MarketingBanner[]> {
    const where: any = {};

    if (categoryId) {
      where.categoryId = BigInt(categoryId);
    }

    const banners = await this.prisma.marketingBanner.findMany({
      where,
      orderBy: {
        priority: 'desc'
      },
      include: {
        category: true
      }
    });

    return banners.map(banner => this.mapPrismaToMarketingBanner(banner));
  }

  /**
   * Map Prisma marketing banner to domain marketing banner
   */
  private mapPrismaToMarketingBanner(banner: any): MarketingBanner {
    return new MarketingBanner({
      id: banner.id.toString(),
      title_237: banner.title237,
      description_237: undefined, // Ce champ n'est pas disponible dans le modèle Prisma
      image_url: banner.imageUrl,
      cta_url: banner.ctaUrl,
      category_id: banner.categoryId ? banner.categoryId.toString() : undefined,
      priority: banner.priority || 0,
      start_date: banner.startDate,
      end_date: banner.endDate,
      active: banner.active ?? true,
      created_at: new Date(), // Ces champs ne sont pas dans le schéma Prisma actuel
      updated_at: new Date(), // On utilise la date actuelle comme approximation
      created_by: "system" // Valeur par défaut car non disponible dans le modèle
    });
  }
}