import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { BatteryStateEnum, PhysicalConditionEnum, TradeStatusEnum } from "@prisma/client";
import { TradeInServicePort } from "../../../domain/tradein/tradein.port";
import {
  TradeInRequest,
  Device,
  DeviceCondition,
  TradeInStatus,
} from "../../../domain/tradein/tradein.entity";

@Injectable()
export class PrismaTradeInService implements TradeInServicePort {
  constructor(private prisma: PrismaService) {}

  async createTradeInRequest(
    userId: string,
    deviceId: string,
    condition: DeviceCondition,
    description?: string,
    images?: string[],
  ): Promise<TradeInRequest> {
    // Récupérer les informations du device
    const device = await this.getDeviceDetailsFromId(deviceId);
    
    // Calculer la valeur estimée
    const estimatedValue = await this.calculateEstimatedValue(deviceId, condition);
    
    // Créer la demande de trade-in
    const tradeIn = await this.prisma.tradeIn.create({
      data: {
        userId,
        deviceType: device.category,
        brand: device.brand,
        model: device.model,
        physicalCondition: this.mapConditionToPrisma(condition),
        quoteValueXaf: estimatedValue,
        status: TradeStatusEnum.pending,
        batteryState: BatteryStateEnum.good, // Valeur par défaut
        isUnlocked: true, // Valeur par défaut
        invoiceProvided: false, // Valeur par défaut
        // Création des photos si fournies
        photos: images && images.length > 0 ? {
          create: images.map(url => ({
            photoUrl: url
          }))
        } : undefined
      },
      include: {
        photos: true,
      }
    });

    // Construire et retourner l'objet de domaine
    return {
      id: tradeIn.id,
      userId: tradeIn.userId,
      deviceId,
      device,
      condition,
      description: description || "",
      images: tradeIn.photos ? tradeIn.photos.map(photo => photo.photoUrl) : [],
      estimatedValue,
      finalValue: estimatedValue, // Même valeur initialement
      status: TradeInStatus.PENDING,
      createdAt: tradeIn.createdAt,
      updatedAt: tradeIn.updatedAt
    };
  }

  async getTradeInRequest(id: string, userId?: string): Promise<TradeInRequest> {
    const tradeIn = await this.prisma.tradeIn.findUnique({
      where: { id },
      include: {
        photos: true
      }
    });

    if (!tradeIn) {
      throw new Error(`Trade-in request with id ${id} not found`);
    }

    if (userId && tradeIn.userId !== userId) {
      throw new Error("You are not authorized to view this trade-in request");
    }

    // Récupérer les informations du device
    const device = await this.getDeviceDetailsFromTradeIn(tradeIn);

    // Construire et retourner l'objet de domaine
    return {
      id: tradeIn.id,
      userId: tradeIn.userId,
      deviceId: `${tradeIn.deviceType}-${tradeIn.brand}-${tradeIn.model}`.toLowerCase().replace(/\s+/g, '-'),
      device,
      condition: this.mapPrismaConditionToDomain(tradeIn.physicalCondition),
      description: "", // Non stocké dans le modèle actuel
      images: tradeIn.photos ? tradeIn.photos.map(photo => photo.photoUrl) : [],
      estimatedValue: Number(tradeIn.quoteValueXaf),
      finalValue: Number(tradeIn.quoteValueXaf),
      status: this.mapPrismaStatusToDomain(tradeIn.status),
      createdAt: tradeIn.createdAt,
      updatedAt: tradeIn.updatedAt
    };
  }

  async getUserTradeInRequests(userId: string): Promise<TradeInRequest[]> {
    const tradeIns = await this.prisma.tradeIn.findMany({
      where: { userId },
      include: {
        photos: true
      }
    });

    // Mapper tous les trade-ins en objets de domaine
    const requests: TradeInRequest[] = [];
    
    for (const tradeIn of tradeIns) {
      const device = await this.getDeviceDetailsFromTradeIn(tradeIn);
      
      requests.push({
        id: tradeIn.id,
        userId: tradeIn.userId,
        deviceId: `${tradeIn.deviceType}-${tradeIn.brand}-${tradeIn.model}`.toLowerCase().replace(/\s+/g, '-'),
        device,
        condition: this.mapPrismaConditionToDomain(tradeIn.physicalCondition),
        description: "", // Non stocké dans le modèle actuel
        images: tradeIn.photos ? tradeIn.photos.map(photo => photo.photoUrl) : [],
        estimatedValue: Number(tradeIn.quoteValueXaf),
        finalValue: Number(tradeIn.quoteValueXaf),
        status: this.mapPrismaStatusToDomain(tradeIn.status),
        createdAt: tradeIn.createdAt,
        updatedAt: tradeIn.updatedAt
      });
    }

    return requests;
  }

  async updateTradeInStatus(
    id: string,
    status: TradeInStatus,
    evaluatorNotes?: string,
  ): Promise<TradeInRequest> {
    const tradeIn = await this.prisma.tradeIn.update({
      where: { id },
      data: {
        status: this.mapStatusToPrisma(status),
        // Dans une implémentation complète, on stockerait les notes de l'évaluateur
      },
      include: {
        photos: true
      }
    });

    // Récupérer les informations du device
    const device = await this.getDeviceDetailsFromTradeIn(tradeIn);

    // Construire et retourner l'objet de domaine mis à jour
    return {
      id: tradeIn.id,
      userId: tradeIn.userId,
      deviceId: `${tradeIn.deviceType}-${tradeIn.brand}-${tradeIn.model}`.toLowerCase().replace(/\s+/g, '-'),
      device,
      condition: this.mapPrismaConditionToDomain(tradeIn.physicalCondition),
      description: "", // Non stocké dans le modèle actuel
      images: tradeIn.photos ? tradeIn.photos.map(photo => photo.photoUrl) : [],
      estimatedValue: Number(tradeIn.quoteValueXaf),
      finalValue: Number(tradeIn.quoteValueXaf),
      status: this.mapPrismaStatusToDomain(tradeIn.status),
      createdAt: tradeIn.createdAt,
      updatedAt: tradeIn.updatedAt
    };
  }

  async evaluateTradeIn(
    requestId: string,
    evaluatorId: string,
    condition: DeviceCondition,
    functionalityScore: number,
    cosmeticScore: number,
    notes: string,
  ): Promise<TradeInRequest> {
    // Récupérer le trade-in existant
    const existingTradeIn = await this.prisma.tradeIn.findUnique({
      where: { id: requestId },
      include: { photos: true }
    });

    if (!existingTradeIn) {
      throw new Error(`Trade-in request with id ${requestId} not found`);
    }

    // Calculer la valeur finale basée sur les scores
    const baseValue = Number(existingTradeIn.quoteValueXaf);
    const functionalityFactor = functionalityScore / 100;
    const cosmeticFactor = cosmeticScore / 100;
    const finalValue = Math.round(baseValue * (functionalityFactor * 0.7 + cosmeticFactor * 0.3));

    // Mettre à jour le trade-in avec l'évaluation
    const updatedTradeIn = await this.prisma.tradeIn.update({
      where: { id: requestId },
      data: {
        physicalCondition: this.mapConditionToPrisma(condition),
        quoteValueXaf: finalValue,
        status: TradeStatusEnum.quoted // Passer au statut "quoted" après évaluation
      },
      include: { photos: true }
    });

    // Récupérer les informations du device
    const device = await this.getDeviceDetailsFromTradeIn(updatedTradeIn);

    // Construire et retourner l'objet de domaine mis à jour
    return {
      id: updatedTradeIn.id,
      userId: updatedTradeIn.userId,
      deviceId: `${updatedTradeIn.deviceType}-${updatedTradeIn.brand}-${updatedTradeIn.model}`.toLowerCase().replace(/\s+/g, '-'),
      device,
      condition: this.mapPrismaConditionToDomain(updatedTradeIn.physicalCondition),
      description: "", // Non stocké dans le modèle actuel
      images: updatedTradeIn.photos ? updatedTradeIn.photos.map(photo => photo.photoUrl) : [],
      estimatedValue: baseValue,
      finalValue,
      status: this.mapPrismaStatusToDomain(updatedTradeIn.status),
      createdAt: updatedTradeIn.createdAt,
      updatedAt: updatedTradeIn.updatedAt
    };
  }

  async searchDevices(query: string, category?: string): Promise<Device[]> {
    // Rechercher des trade-ins existants qui correspondent aux critères
    // pour construire une liste de devices basée sur des données réelles
    const tradeIns = await this.prisma.tradeIn.findMany({
      where: {
        OR: [
          { brand: { contains: query, mode: 'insensitive' } },
          { model: { contains: query, mode: 'insensitive' } },
          { deviceType: { contains: query, mode: 'insensitive' } }
        ],
        ...(category ? { deviceType: { contains: category, mode: 'insensitive' } } : {})
      },
      distinct: ['brand', 'model', 'deviceType'],
      take: 10
    });

    // Extraire les devices uniques
    const uniqueDevices = new Map<string, Device>();
    
    for (const tradeIn of tradeIns) {
      const deviceId = `${tradeIn.deviceType}-${tradeIn.brand}-${tradeIn.model}`.toLowerCase().replace(/\s+/g, '-');
      
      if (!uniqueDevices.has(deviceId)) {
        // Utiliser les valeurs moyennes des trade-ins comme estimation
        uniqueDevices.set(deviceId, {
          id: deviceId,
          brand: tradeIn.brand,
          model: tradeIn.model,
          category: tradeIn.deviceType,
          baseValue: Number(tradeIn.quoteValueXaf),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // Si aucun device n'est trouvé, ajouter quelques appareils communs pour faciliter l'utilisation
    if (uniqueDevices.size === 0) {
      const defaultDevices = [
        { brand: 'Samsung', model: 'Galaxy S21', category: 'smartphone', baseValue: 150000 },
        { brand: 'Apple', model: 'iPhone 13', category: 'smartphone', baseValue: 250000 },
        { brand: 'Xiaomi', model: 'Redmi Note 10', category: 'smartphone', baseValue: 80000 },
      ].filter(d => !category || d.category.includes(category || ''));

      for (const device of defaultDevices) {
        if (
          device.brand.toLowerCase().includes(query.toLowerCase()) ||
          device.model.toLowerCase().includes(query.toLowerCase()) ||
          device.category.toLowerCase().includes(query.toLowerCase())
        ) {
          const deviceId = `${device.category}-${device.brand}-${device.model}`.toLowerCase().replace(/\s+/g, '-');
          uniqueDevices.set(deviceId, {
            id: deviceId,
            brand: device.brand,
            model: device.model,
            category: device.category,
            baseValue: device.baseValue,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    }

    return Array.from(uniqueDevices.values());
  }

  async getDevicesByCategory(category: string): Promise<Device[]> {
    // Rechercher des trade-ins existants dans cette catégorie
    // pour construire une liste de devices basée sur des données réelles
    const tradeIns = await this.prisma.tradeIn.findMany({
      where: {
        deviceType: { contains: category, mode: 'insensitive' }
      },
      distinct: ['brand', 'model', 'deviceType'],
      take: 20
    });

    // Extraire les devices uniques
    const uniqueDevices = new Map<string, Device>();
    
    for (const tradeIn of tradeIns) {
      const deviceId = `${tradeIn.deviceType}-${tradeIn.brand}-${tradeIn.model}`.toLowerCase().replace(/\s+/g, '-');
      
      if (!uniqueDevices.has(deviceId)) {
        uniqueDevices.set(deviceId, {
          id: deviceId,
          brand: tradeIn.brand,
          model: tradeIn.model,
          category: tradeIn.deviceType,
          baseValue: Number(tradeIn.quoteValueXaf),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // Si aucun device n'est trouvé, ajouter quelques appareils communs pour faciliter l'utilisation
    if (uniqueDevices.size === 0) {
      const defaultDevices = {
        smartphone: [
          { brand: 'Samsung', model: 'Galaxy S21', baseValue: 150000 },
          { brand: 'Apple', model: 'iPhone 13', baseValue: 250000 },
          { brand: 'Xiaomi', model: 'Redmi Note 10', baseValue: 80000 },
        ],
        laptop: [
          { brand: 'HP', model: 'Pavilion', baseValue: 200000 },
          { brand: 'Dell', model: 'XPS 13', baseValue: 350000 },
          { brand: 'Lenovo', model: 'ThinkPad', baseValue: 280000 },
        ],
        tablet: [
          { brand: 'Apple', model: 'iPad Pro', baseValue: 180000 },
          { brand: 'Samsung', model: 'Galaxy Tab S7', baseValue: 150000 },
          { brand: 'Lenovo', model: 'Tab P11', baseValue: 100000 },
        ]
      }[category.toLowerCase()] || [];

      for (const device of defaultDevices) {
        const deviceId = `${category}-${device.brand}-${device.model}`.toLowerCase().replace(/\s+/g, '-');
        uniqueDevices.set(deviceId, {
          id: deviceId,
          brand: device.brand,
          model: device.model,
          category: category.toLowerCase(),
          baseValue: device.baseValue,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    return Array.from(uniqueDevices.values());
  }

  async calculateEstimatedValue(
    deviceId: string,
    condition: DeviceCondition,
  ): Promise<number> {
    // Extraire les informations du deviceId
    const [category, brand, model] = deviceId.split('-');
    
    // Rechercher des trade-ins similaires pour obtenir une référence de prix
    const similarTradeIns = await this.prisma.tradeIn.findMany({
      where: {
        deviceType: { contains: category, mode: 'insensitive' },
        brand: { contains: brand, mode: 'insensitive' },
        model: { contains: model, mode: 'insensitive' },
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // Calculer une valeur de base à partir des trade-ins similaires ou utiliser une valeur par défaut
    let baseValue = 0;
    
    if (similarTradeIns.length > 0) {
      // Moyenne des valeurs des trade-ins similaires
      baseValue = similarTradeIns.reduce((sum, item) => sum + Number(item.quoteValueXaf), 0) / similarTradeIns.length;
    } else {
      // Valeurs par défaut par catégorie
      const defaultValues = {
        smartphone: 100000,
        laptop: 200000,
        tablet: 120000,
        desktop: 150000,
        tv: 80000,
        audio: 50000,
        default: 75000
      };
      
      baseValue = defaultValues[category] || defaultValues.default;
    }

    // Appliquer un facteur basé sur la condition
    const conditionFactors = {
      [DeviceCondition.EXCELLENT]: 1.0,
      [DeviceCondition.GOOD]: 0.8,
      [DeviceCondition.FAIR]: 0.6,
      [DeviceCondition.POOR]: 0.4,
      [DeviceCondition.BROKEN]: 0.2
    };

    const conditionFactor = conditionFactors[condition] || 0.6;
    
    // Calculer la valeur finale
    return Math.round(baseValue * conditionFactor);
  }

  // Méthodes utilitaires privées
  private async getDeviceDetailsFromId(deviceId: string): Promise<Device> {
    // Extraire les informations du deviceId
    const parts = deviceId.split('-');
    const category = parts[0] || 'unknown';
    const brand = parts[1] || 'unknown';
    const model = parts.slice(2).join('-') || 'unknown';
    
    // Rechercher des trade-ins similaires pour obtenir une référence de prix
    const similarTradeIns = await this.prisma.tradeIn.findMany({
      where: {
        deviceType: { contains: category, mode: 'insensitive' },
        brand: { contains: brand, mode: 'insensitive' },
        model: { contains: model, mode: 'insensitive' },
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // Calculer une valeur de base à partir des trade-ins similaires ou utiliser une valeur par défaut
    let baseValue = 0;
    
    if (similarTradeIns.length > 0) {
      // Moyenne des valeurs des trade-ins similaires
      baseValue = similarTradeIns.reduce((sum, item) => sum + Number(item.quoteValueXaf), 0) / similarTradeIns.length;
    } else {
      // Valeurs par défaut par catégorie
      const defaultValues = {
        smartphone: 100000,
        laptop: 200000,
        tablet: 120000,
        desktop: 150000,
        tv: 80000,
        audio: 50000,
        default: 75000
      };
      
      baseValue = defaultValues[category] || defaultValues.default;
    }

    return {
      id: deviceId,
      brand,
      model,
      category,
      baseValue,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async getDeviceDetailsFromTradeIn(tradeIn: any): Promise<Device> {
    const deviceId = `${tradeIn.deviceType}-${tradeIn.brand}-${tradeIn.model}`.toLowerCase().replace(/\s+/g, '-');
    
    return {
      id: deviceId,
      brand: tradeIn.brand,
      model: tradeIn.model,
      category: tradeIn.deviceType,
      baseValue: Number(tradeIn.quoteValueXaf) * 1.25, // Valeur estimée avant dépréciation
      createdAt: tradeIn.createdAt,
      updatedAt: tradeIn.updatedAt
    };
  }

  private mapConditionToPrisma(condition: DeviceCondition): PhysicalConditionEnum {
    const mapping = {
      [DeviceCondition.EXCELLENT]: PhysicalConditionEnum.excellent,
      [DeviceCondition.GOOD]: PhysicalConditionEnum.good,
      [DeviceCondition.FAIR]: PhysicalConditionEnum.fair,
      [DeviceCondition.POOR]: PhysicalConditionEnum.poor,
      [DeviceCondition.BROKEN]: PhysicalConditionEnum.damaged
    };
    
    return mapping[condition] || PhysicalConditionEnum.fair;
  }

  private mapPrismaConditionToDomain(condition: PhysicalConditionEnum): DeviceCondition {
    const mapping = {
      [PhysicalConditionEnum.excellent]: DeviceCondition.EXCELLENT,
      [PhysicalConditionEnum.good]: DeviceCondition.GOOD,
      [PhysicalConditionEnum.fair]: DeviceCondition.FAIR,
      [PhysicalConditionEnum.poor]: DeviceCondition.POOR,
      [PhysicalConditionEnum.damaged]: DeviceCondition.BROKEN
    };
    
    return mapping[condition] || DeviceCondition.FAIR;
  }

  private mapStatusToPrisma(status: TradeInStatus): TradeStatusEnum {
    const mapping = {
      [TradeInStatus.PENDING]: TradeStatusEnum.pending,
      [TradeInStatus.EVALUATING]: TradeStatusEnum.quoted,
      [TradeInStatus.APPROVED]: TradeStatusEnum.accepted,
      [TradeInStatus.REJECTED]: TradeStatusEnum.rejected,
      [TradeInStatus.COMPLETED]: TradeStatusEnum.completed,
      [TradeInStatus.CANCELLED]: TradeStatusEnum.cancelled
    };
    
    return mapping[status] || TradeStatusEnum.pending;
  }

  private mapPrismaStatusToDomain(status: TradeStatusEnum): TradeInStatus {
    const mapping = {
      [TradeStatusEnum.pending]: TradeInStatus.PENDING,
      [TradeStatusEnum.quoted]: TradeInStatus.EVALUATING,
      [TradeStatusEnum.accepted]: TradeInStatus.APPROVED,
      [TradeStatusEnum.rejected]: TradeInStatus.REJECTED,
      [TradeStatusEnum.completed]: TradeInStatus.COMPLETED,
      [TradeStatusEnum.cancelled]: TradeInStatus.CANCELLED
    };
    
    return mapping[status] || TradeInStatus.PENDING;
  }
}