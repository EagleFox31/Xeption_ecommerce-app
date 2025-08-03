import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PhysicalConditionEnum, TradeStatusEnum } from "@prisma/client";
import {
  TradeInRequest,
  Device,
  TradeInEvaluation,
  DeviceCondition,
  TradeInStatus,
} from "../../../domain/tradein/tradein.entity";
import { TradeInRepositoryPort } from "../../../domain/tradein/tradein.port";

@Injectable()
export class PrismaTradeInRepository implements TradeInRepositoryPort {
  constructor(private prisma: PrismaService) {}

  // Trade-in requests
  async createTradeInRequest(
    request: Omit<TradeInRequest, "id" | "createdAt" | "updatedAt">
  ): Promise<TradeInRequest> {
    // Adaptation du modèle de domaine vers le modèle Prisma
    // Note: Le modèle Prisma ne stocke pas directement les devices comme entités séparées
    // mais comme des attributs du trade-in
    
    let deviceInfo: { type: string; brand: string; model: string } = {
      type: "unknown",
      brand: "unknown",
      model: "unknown"
    };

    // Si on a un device, on extrait les informations
    if (request.device) {
      deviceInfo = {
        type: request.device.category,
        brand: request.device.brand,
        model: request.device.model
      };
    }

    const tradeIn = await this.prisma.tradeIn.create({
      data: {
        userId: request.userId,
        deviceType: deviceInfo.type,
        brand: deviceInfo.brand,
        model: deviceInfo.model,
        physicalCondition: this.mapDeviceConditionToPrisma(request.condition),
        quoteValueXaf: request.estimatedValue,
        status: this.mapTradeInStatusToPrisma(request.status),
        // Création des photos associées au trade-in
        photos: {
          create: request.images.map(url => ({
            photoUrl: url
          }))
        }
      },
      include: {
        photos: true,
      }
    });

    return this.mapPrismaToTradeInRequest(tradeIn);
  }

  async getTradeInRequestById(id: string): Promise<TradeInRequest | null> {
    const tradeIn = await this.prisma.tradeIn.findUnique({
      where: { id },
      include: {
        photos: true
      }
    });

    if (!tradeIn) {
      return null;
    }

    return this.mapPrismaToTradeInRequest(tradeIn);
  }

  async getTradeInRequestsByUserId(userId: string): Promise<TradeInRequest[]> {
    const tradeIns = await this.prisma.tradeIn.findMany({
      where: { userId },
      include: {
        photos: true
      }
    });

    return tradeIns.map(tradeIn => this.mapPrismaToTradeInRequest(tradeIn));
  }

  async updateTradeInRequest(
    id: string,
    updates: Partial<TradeInRequest>
  ): Promise<TradeInRequest> {
    // Conversion des champs du domaine vers le modèle Prisma
    const prismaUpdates: any = {};

    if (updates.condition) {
      prismaUpdates.physicalCondition = this.mapDeviceConditionToPrisma(updates.condition);
    }

    if (updates.status) {
      prismaUpdates.status = this.mapTradeInStatusToPrisma(updates.status);
    }

    if (updates.estimatedValue !== undefined) {
      prismaUpdates.quoteValueXaf = updates.estimatedValue;
    }

    // Mise à jour du trade-in dans la base de données
    const updatedTradeIn = await this.prisma.tradeIn.update({
      where: { id },
      data: prismaUpdates,
      include: {
        photos: true
      }
    });

    // Si de nouvelles images sont fournies, on supprime les anciennes et on crée les nouvelles
    if (updates.images && updates.images.length > 0) {
      // Supprimer les photos existantes
      await this.prisma.tradeInPhoto.deleteMany({
        where: { tradeInId: id }
      });

      // Ajouter les nouvelles photos
      await Promise.all(
        updates.images.map(url =>
          this.prisma.tradeInPhoto.create({
            data: {
              tradeInId: id,
              photoUrl: url
            }
          })
        )
      );

      // Récupérer à nouveau le trade-in avec les nouvelles photos
      const refreshedTradeIn = await this.prisma.tradeIn.findUnique({
        where: { id },
        include: {
          photos: true
        }
      });

      return this.mapPrismaToTradeInRequest(refreshedTradeIn);
    }

    return this.mapPrismaToTradeInRequest(updatedTradeIn);
  }

  async deleteTradeInRequest(id: string): Promise<void> {
    // Supprimer d'abord les photos associées
    await this.prisma.tradeInPhoto.deleteMany({
      where: { tradeInId: id }
    });

    // Puis supprimer le trade-in
    await this.prisma.tradeIn.delete({
      where: { id }
    });
  }

  // Devices - Note: Dans ce modèle, les devices ne sont pas stockés séparément
  // mais les informations sont intégrées aux trade-ins
  async getDeviceById(id: string): Promise<Device | null> {
    // Simulation car nous n'avons pas de table Device
    // En réalité, on pourrait soit:
    // 1. Créer une table Device
    // 2. Extraire les informations des trade-ins existants
    // 3. Avoir une source externe pour les devices

    // Cette implémentation est simulée car les devices ne sont pas 
    // stockés comme des entités séparées dans le modèle actuel
    return {
      id,
      brand: "Simulated Brand",
      model: "Simulated Model",
      category: "Simulated Category",
      baseValue: 50000,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async searchDevices(query: string, category?: string): Promise<Device[]> {
    // Simulation pour la même raison que getDeviceById
    return [
      {
        id: "device-1",
        brand: "Simulated Brand",
        model: `Matching ${query}`,
        category: category || "Smartphone",
        baseValue: 50000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  async getDevicesByCategory(category: string): Promise<Device[]> {
    // Simulation pour la même raison que getDeviceById
    return [
      {
        id: "device-category-1",
        brand: "Simulated Brand",
        model: "Category Model",
        category,
        baseValue: 50000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  // Evaluations - Note: Les évaluations ne sont pas stockées séparément 
  // mais intégrées aux trade-ins
  async createEvaluation(
    evaluation: Omit<TradeInEvaluation, "evaluatedAt">
  ): Promise<TradeInEvaluation> {
    // Mise à jour du trade-in avec les informations d'évaluation
    const updatedTradeIn = await this.prisma.tradeIn.update({
      where: { id: evaluation.requestId },
      data: {
        physicalCondition: this.mapDeviceConditionToPrisma(evaluation.condition),
        quoteValueXaf: evaluation.finalValue,
        // Dans un système plus complet, on stockerait les scores et notes séparément
      }
    });

    // Construction d'une évaluation à partir des données mises à jour
    return {
      requestId: updatedTradeIn.id,
      evaluatorId: evaluation.evaluatorId,
      condition: evaluation.condition,
      functionalityScore: evaluation.functionalityScore,
      cosmeticScore: evaluation.cosmeticScore,
      marketValue: evaluation.marketValue,
      finalValue: evaluation.finalValue,
      notes: evaluation.notes,
      evaluatedAt: new Date()
    };
  }

  async getEvaluationByRequestId(
    requestId: string
  ): Promise<TradeInEvaluation | null> {
    // Comme nous n'avons pas de table d'évaluation séparée,
    // nous simulons à partir des données de trade-in
    const tradeIn = await this.prisma.tradeIn.findUnique({
      where: { id: requestId }
    });

    if (!tradeIn || tradeIn.status !== TradeStatusEnum.quoted) {
      return null;
    }

    // Construction d'une évaluation simulée
    return {
      requestId: tradeIn.id,
      evaluatorId: "system", // Valeur simulée
      condition: this.mapPrismaToDeviceCondition(tradeIn.physicalCondition),
      functionalityScore: 80, // Valeur simulée
      cosmeticScore: 75, // Valeur simulée
      marketValue: Number(tradeIn.quoteValueXaf) * 1.2, // Valeur simulée
      finalValue: Number(tradeIn.quoteValueXaf),
      notes: "Evaluation générée automatiquement", // Valeur simulée
      evaluatedAt: tradeIn.updatedAt
    };
  }

  // Méthodes utilitaires pour le mapping
  private mapPrismaToTradeInRequest(tradeIn: any): TradeInRequest {
    // Construction d'un Device simulé car il n'est pas stocké séparément
    const simulatedDevice: Device = {
      id: `device-${tradeIn.deviceType}-${tradeIn.brand}-${tradeIn.model}`,
      brand: tradeIn.brand,
      model: tradeIn.model,
      category: tradeIn.deviceType,
      baseValue: Number(tradeIn.quoteValueXaf) * 0.8, // Valeur simulée
      createdAt: tradeIn.createdAt,
      updatedAt: tradeIn.updatedAt
    };

    return {
      id: tradeIn.id,
      userId: tradeIn.userId,
      deviceId: simulatedDevice.id,
      device: simulatedDevice,
      condition: this.mapPrismaToDeviceCondition(tradeIn.physicalCondition),
      description: "", // Non stocké directement dans le modèle actuel
      images: tradeIn.photos.map(photo => photo.photoUrl),
      estimatedValue: Number(tradeIn.quoteValueXaf),
      finalValue: Number(tradeIn.quoteValueXaf), // Même valeur car pas de distinction dans le modèle actuel
      status: this.mapPrismaToTradeInStatus(tradeIn.status),
      createdAt: tradeIn.createdAt,
      updatedAt: tradeIn.updatedAt
    };
  }

  private mapDeviceConditionToPrisma(condition: DeviceCondition): PhysicalConditionEnum {
    switch (condition) {
      case DeviceCondition.EXCELLENT:
        return PhysicalConditionEnum.excellent;
      case DeviceCondition.GOOD:
        return PhysicalConditionEnum.good;
      case DeviceCondition.FAIR:
        return PhysicalConditionEnum.fair;
      case DeviceCondition.POOR:
        return PhysicalConditionEnum.poor;
      case DeviceCondition.BROKEN:
        return PhysicalConditionEnum.damaged;
      default:
        return PhysicalConditionEnum.fair;
    }
  }

  private mapPrismaToDeviceCondition(condition: PhysicalConditionEnum): DeviceCondition {
    switch (condition) {
      case PhysicalConditionEnum.excellent:
        return DeviceCondition.EXCELLENT;
      case PhysicalConditionEnum.good:
        return DeviceCondition.GOOD;
      case PhysicalConditionEnum.fair:
        return DeviceCondition.FAIR;
      case PhysicalConditionEnum.poor:
        return DeviceCondition.POOR;
      case PhysicalConditionEnum.damaged:
        return DeviceCondition.BROKEN;
      default:
        return DeviceCondition.FAIR;
    }
  }

  private mapTradeInStatusToPrisma(status: TradeInStatus): TradeStatusEnum {
    switch (status) {
      case TradeInStatus.PENDING:
        return TradeStatusEnum.pending;
      case TradeInStatus.EVALUATING:
        return TradeStatusEnum.pending; // Pas d'équivalent exact
      case TradeInStatus.APPROVED:
        return TradeStatusEnum.accepted;
      case TradeInStatus.REJECTED:
        return TradeStatusEnum.rejected;
      case TradeInStatus.COMPLETED:
        return TradeStatusEnum.completed;
      case TradeInStatus.CANCELLED:
        return TradeStatusEnum.cancelled;
      default:
        return TradeStatusEnum.pending;
    }
  }

  private mapPrismaToTradeInStatus(status: TradeStatusEnum): TradeInStatus {
    switch (status) {
      case TradeStatusEnum.pending:
        return TradeInStatus.PENDING;
      case TradeStatusEnum.quoted:
        return TradeInStatus.EVALUATING;
      case TradeStatusEnum.accepted:
        return TradeInStatus.APPROVED;
      case TradeStatusEnum.rejected:
        return TradeInStatus.REJECTED;
      case TradeStatusEnum.completed:
        return TradeInStatus.COMPLETED;
      case TradeStatusEnum.cancelled:
        return TradeInStatus.CANCELLED;
      default:
        return TradeInStatus.PENDING;
    }
  }
}