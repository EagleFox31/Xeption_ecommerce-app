import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { BackOrderStatusEnum } from "@prisma/client";
import {
  BackorderRequest,
  BackorderNotification,
  ProductAvailability,
  BackorderSummary,
  BackorderStatus,
  BackorderPriority
} from "../../../domain/backorder/backorder.entity";
import { BackorderRepository } from "../../../domain/backorder/backorder.port";

@Injectable()
export class PrismaBackorderRepository implements BackorderRepository {
  constructor(private prisma: PrismaService) {}

  async createBackorderRequest(
    request: Omit<BackorderRequest, "id" | "createdAt" | "updatedAt">
  ): Promise<BackorderRequest> {
    // Conversion entre l'entité de domaine et le modèle Prisma
    const backOrder = await this.prisma.backOrder.create({
      data: {
        userId: request.userId,
        productRef: request.productId, // Mapping du productId vers productRef
        desiredQty: request.quantity,   // Mapping de quantity vers desiredQty
        maxBudgetXaf: request.maxPrice, // Mapping de maxPrice vers maxBudgetXaf
        status: this.mapDomainStatusToPrisma(request.status),
        agentNote: request.notes,
        // Les préférences de notification ne sont pas directement mappées
        // car le schéma Prisma ne les stocke pas de la même façon
      }
    });

    return this.mapPrismaToBackorderRequest(backOrder);
  }

  async getBackorderRequestById(id: string): Promise<BackorderRequest | null> {
    const backOrder = await this.prisma.backOrder.findUnique({
      where: { id },
      include: {
        notifications: true,
      },
    });

    if (!backOrder) {
      return null;
    }

    return this.mapPrismaToBackorderRequest(backOrder);
  }

  async getUserBackorderRequests(
    userId: string,
    filters?: {
      status?: BackorderStatus;
      priority?: BackorderPriority;
      productId?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<BackorderRequest[]> {
    // Construction de la condition where basée sur les filtres
    const where: any = { userId };

    if (filters?.status) {
      where.status = this.mapDomainStatusToPrisma(filters.status);
    }

    if (filters?.productId) {
      where.productRef = filters.productId;
    }

    // Note: priority n'est pas stocké dans le modèle Prisma, donc on ne peut pas filtrer dessus

    const backOrders = await this.prisma.backOrder.findMany({
      where,
      include: {
        notifications: true,
      },
      take: filters?.limit,
      skip: filters?.offset,
      orderBy: { createdAt: 'desc' },
    });

    return backOrders.map(backOrder => this.mapPrismaToBackorderRequest(backOrder));
  }

  async updateBackorderRequest(
    id: string,
    updates: Partial<BackorderRequest>
  ): Promise<BackorderRequest> {
    // Conversion des champs de l'entité de domaine vers le modèle Prisma
    const prismaUpdates: any = {};

    if (updates.quantity !== undefined) {
      prismaUpdates.desiredQty = updates.quantity;
    }

    if (updates.maxPrice !== undefined) {
      prismaUpdates.maxBudgetXaf = updates.maxPrice;
    }

    if (updates.status !== undefined) {
      prismaUpdates.status = this.mapDomainStatusToPrisma(updates.status);
    }

    if (updates.notes !== undefined) {
      prismaUpdates.agentNote = updates.notes;
    }

    // Mise à jour dans la base de données
    const updatedBackOrder = await this.prisma.backOrder.update({
      where: { id },
      data: prismaUpdates,
      include: {
        notifications: true,
      },
    });

    return this.mapPrismaToBackorderRequest(updatedBackOrder);
  }

  async deleteBackorderRequest(id: string): Promise<void> {
    await this.prisma.backOrder.delete({
      where: { id },
    });
  }

  async createNotification(
    notification: Omit<BackorderNotification, "id" | "sentAt">
  ): Promise<BackorderNotification> {
    // BackOrderNotification dans Prisma ne correspond pas exactement
    // à BackorderNotification dans le domaine, donc on fait une adaptation
    const backOrderNotification = await this.prisma.backOrderNotification.create({
      data: {
        backOrderId: notification.backorderRequestId,
        // Les autres champs comme type, message, channels ne sont pas dans le modèle Prisma
      },
      include: {
        backOrder: true,
      },
    });

    // On a besoin de créer un objet conforme à l'interface du domaine
    return {
      id: backOrderNotification.id.toString(),
      backorderRequestId: backOrderNotification.backOrderId,
      type: 'availability', // Valeur par défaut car non stockée
      message: '', // Valeur par défaut car non stockée
      sentAt: backOrderNotification.notifiedAt,
    };
  }

  async getNotificationsByBackorderRequest(
    backorderRequestId: string
  ): Promise<BackorderNotification[]> {
    const notifications = await this.prisma.backOrderNotification.findMany({
      where: { backOrderId: backorderRequestId },
    });

    return notifications.map(notification => ({
      id: notification.id.toString(),
      backorderRequestId: notification.backOrderId,
      type: 'availability', // Valeur par défaut car non stockée
      message: '', // Valeur par défaut car non stockée
      sentAt: notification.notifiedAt,
    }));
  }

  async checkProductAvailability(productId: string): Promise<ProductAvailability> {
    // Récupération des informations sur le produit
    const product = await this.prisma.product.findFirst({
      where: { 
        OR: [
          { id: BigInt(productId) },
          { sku: productId }
        ]
      },
    });

    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }

    return {
      productId: product.id.toString(),
      inStock: product.stockQty > 0,
      quantity: product.stockQty,
      price: Number(product.priceXaf),
      // expectedRestockDate n'est pas disponible dans le modèle
    };
  }

  async getBackorderRequestsByProduct(productId: string): Promise<BackorderRequest[]> {
    const backOrders = await this.prisma.backOrder.findMany({
      where: { productRef: productId },
      include: {
        notifications: true,
      },
    });

    return backOrders.map(backOrder => this.mapPrismaToBackorderRequest(backOrder));
  }

  async getBackorderSummary(userId?: string): Promise<BackorderSummary> {
    // Construction de la condition where basée sur userId si fourni
    const where = userId ? { userId } : {};

    // Récupération des statistiques
    const [totalRequests, pendingRequests, fulfilledRequests] = await Promise.all([
      this.prisma.backOrder.count({ where }),
      this.prisma.backOrder.count({
        where: {
          ...where,
          status: { in: [BackOrderStatusEnum.open, BackOrderStatusEnum.sourced] }
        }
      }),
      this.prisma.backOrder.count({
        where: {
          ...where,
          status: BackOrderStatusEnum.ordered
        }
      }),
    ]);

    // Récupération des produits les plus demandés
    const productCounts = await this.prisma.backOrder.groupBy({
      by: ['productRef'],
      _count: {
        productRef: true,
      },
      orderBy: {
        _count: {
          productRef: 'desc',
        },
      },
      take: 5,
    });

    // Remarque: le temps d'attente moyen n'est plus requis dans l'interface BackorderSummary
    
    return {
      totalRequests,
      pendingRequests,
      fulfilledRequests,
      cancelledRequests: totalRequests - (pendingRequests + fulfilledRequests),
      mostRequestedProducts: productCounts.map(item => ({
        productId: item.productRef,
        count: item._count.productRef,
      })),
    };
  }

  async getExpiredBackorderRequests(days: number): Promise<BackorderRequest[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - days);

    const expiredBackOrders = await this.prisma.backOrder.findMany({
      where: {
        createdAt: { lt: expiryDate },
        status: { in: [BackOrderStatusEnum.open, BackOrderStatusEnum.sourced] },
      },
      include: {
        notifications: true,
      },
    });

    return expiredBackOrders.map(backOrder => this.mapPrismaToBackorderRequest(backOrder));
  }

  // Méthodes utilitaires pour le mapping
  private mapPrismaToBackorderRequest(backOrder: any): BackorderRequest {
    return {
      id: backOrder.id,
      userId: backOrder.userId,
      productId: backOrder.productRef,
      quantity: backOrder.desiredQty,
      maxPrice: backOrder.maxBudgetXaf ? Number(backOrder.maxBudgetXaf) : undefined,
      priority: BackorderPriority.MEDIUM, // Valeur par défaut car non stockée
      status: this.mapPrismaStatusToDomain(backOrder.status),
      notificationPreferences: {
        email: true, // Valeurs par défaut car non stockées
        sms: false,
        push: false,
      },
      notes: backOrder.agentNote,
      createdAt: backOrder.createdAt,
      updatedAt: backOrder.createdAt, // Le schéma n'a pas de updatedAt
      // expectedDeliveryDate n'est pas disponible dans le modèle
    };
  }

  private mapDomainStatusToPrisma(status: BackorderStatus): BackOrderStatusEnum {
    switch (status) {
      case BackorderStatus.PENDING:
        return BackOrderStatusEnum.open;
      case BackorderStatus.PROCESSING:
        return BackOrderStatusEnum.sourced;
      case BackorderStatus.NOTIFIED:
        return BackOrderStatusEnum.sourced; // Pas d'équivalent exact
      case BackorderStatus.FULFILLED:
        return BackOrderStatusEnum.ordered;
      case BackorderStatus.CANCELLED:
        return BackOrderStatusEnum.cancelled;
      default:
        return BackOrderStatusEnum.open;
    }
  }

  private mapPrismaStatusToDomain(status: BackOrderStatusEnum): BackorderStatus {
    switch (status) {
      case BackOrderStatusEnum.open:
        return BackorderStatus.PENDING;
      case BackOrderStatusEnum.sourced:
        return BackorderStatus.PROCESSING;
      case BackOrderStatusEnum.ordered:
        return BackorderStatus.FULFILLED;
      case BackOrderStatusEnum.cancelled:
        return BackorderStatus.CANCELLED;
      default:
        return BackorderStatus.PENDING;
    }
  }
}