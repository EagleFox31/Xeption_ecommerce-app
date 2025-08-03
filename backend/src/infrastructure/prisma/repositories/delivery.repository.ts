/**
 * Repository Prisma pour le module delivery
 * Implémentation de l'accès aux données via Prisma
 */

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { DeliveryRepositoryPort } from "../../../domain/delivery/delivery.port";
import {
  DeliveryZone,
  DeliveryCost,
} from "../../../domain/delivery/delivery.entity";

@Injectable()
export class PrismaDeliveryRepository implements DeliveryRepositoryPort {
  constructor(private prisma: PrismaService) {}

  async findZoneByLocation(
    region: string,
    city: string,
    commune?: string,
  ): Promise<DeliveryZone | null> {
    const regionData = await this.prisma.region.findFirst({
      where: { name: region },
    });

    if (!regionData) return null;

    const cityData = await this.prisma.city.findFirst({
      where: {
        name: city,
        regionId: regionData.id
      },
    });

    if (!cityData) return null;

    let communeId: number | null = null;
    if (commune) {
      const communeData = await this.prisma.commune.findFirst({
        where: {
          name: commune,
          cityId: cityData.id
        },
      });
      if (communeData) {
        communeId = communeData.id;
      }
    }

    const delivery = await this.prisma.delivery.findFirst({
      where: {
        regionId: regionData.id,
        cityId: cityData.id,
        ...(communeId ? { communeId } : { communeId: null }),
      },
      include: {
        region: true,
        city: true,
        commune: true,
      },
    });

    if (!delivery) return null;

    return this.mapToDeliveryZone(delivery);
  }

  async getCostByZoneId(zoneId: string): Promise<DeliveryCost | null> {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: BigInt(zoneId) },
    });

    if (!delivery) return null;

    return this.mapToDeliveryCost(delivery);
  }

  async findActiveZones(): Promise<DeliveryZone[]> {
    const deliveries = await this.prisma.delivery.findMany({
      include: {
        region: true,
        city: true,
        commune: true,
      },
      orderBy: [
        { region: { name: 'asc' } },
        { city: { name: 'asc' } },
      ],
    });

    return deliveries.map((delivery) => this.mapToDeliveryZone(delivery));
  }

  async findAvailableRegions(): Promise<string[]> {
    const regions = await this.prisma.region.findMany({
      where: {
        deliveries: {
          some: {}
        }
      },
      orderBy: {
        name: 'asc',
      },
    });

    return regions.map(region => region.name);
  }

  async findCitiesByRegion(region: string): Promise<string[]> {
    const regionData = await this.prisma.region.findFirst({
      where: { name: region },
    });

    if (!regionData) return [];

    const cities = await this.prisma.city.findMany({
      where: {
        regionId: regionData.id,
        deliveries: {
          some: {}
        }
      },
      orderBy: {
        name: 'asc',
      },
    });

    return cities.map(city => city.name);
  }

  async findCommunesByCity(region: string, city: string): Promise<string[]> {
    const regionData = await this.prisma.region.findFirst({
      where: { name: region },
    });

    if (!regionData) return [];

    const cityData = await this.prisma.city.findFirst({
      where: {
        name: city,
        regionId: regionData.id
      },
    });

    if (!cityData) return [];

    const communes = await this.prisma.commune.findMany({
      where: {
        cityId: cityData.id,
        deliveries: {
          some: {}
        }
      },
      orderBy: {
        name: 'asc',
      },
    });

    return communes.map(commune => commune.name);
  }

  private mapToDeliveryZone(data: any): DeliveryZone {
    return {
      id: data.id.toString(),
      region: data.region.name,
      city: data.city.name,
      commune: data.commune?.name || null,
      isActive: true, // Assuming all entries in the DB are active
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private mapToDeliveryCost(data: any): DeliveryCost {
    return {
      id: data.id.toString(),
      zoneId: data.id.toString(),
      baseFee: data.feeXaf.toNumber(),
      weightMultiplier: 1000, // Default values since schema doesn't have these fields
      distanceMultiplier: 500,
      minFee: data.feeXaf.toNumber(),
      maxFee: data.feeXaf.toNumber() * 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}