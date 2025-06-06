/**
 * Repository Supabase pour le module delivery
 * Implémentation de l'accès aux données
 */

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { DeliveryRepositoryPort } from "../../../domain/delivery/delivery.port";
import {
  DeliveryZone,
  DeliveryCost,
} from "../../../domain/delivery/delivery.entity";

@Injectable()
export class DeliveryRepository implements DeliveryRepositoryPort {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>("SUPABASE_URL"),
      this.configService.get<string>("SUPABASE_SERVICE_KEY"),
    );
  }

  async findZoneByLocation(
    region: string,
    city: string,
    commune?: string,
  ): Promise<DeliveryZone | null> {
    let query = this.supabase
      .from("delivery_zones")
      .select("*")
      .eq("region", region)
      .eq("city", city)
      .eq("is_active", true);

    if (commune) {
      query = query.eq("commune", commune);
    } else {
      query = query.is("commune", null);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return null;
    }

    return this.mapToDeliveryZone(data);
  }

  async getCostByZoneId(zoneId: string): Promise<DeliveryCost | null> {
    const { data, error } = await this.supabase
      .from("delivery_costs")
      .select("*")
      .eq("zone_id", zoneId)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapToDeliveryCost(data);
  }

  async findActiveZones(): Promise<DeliveryZone[]> {
    const { data, error } = await this.supabase
      .from("delivery_zones")
      .select("*")
      .eq("is_active", true)
      .order("region", { ascending: true })
      .order("city", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(this.mapToDeliveryZone);
  }

  async findAvailableRegions(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("delivery_zones")
      .select("region")
      .eq("is_active", true)
      .order("region", { ascending: true });

    if (error || !data) {
      return [];
    }

    // Retourner les régions uniques
    const regions = [...new Set(data.map((item) => item.region))];
    return regions;
  }

  async findCitiesByRegion(region: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("delivery_zones")
      .select("city")
      .eq("region", region)
      .eq("is_active", true)
      .order("city", { ascending: true });

    if (error || !data) {
      return [];
    }

    // Retourner les villes uniques
    const cities = [...new Set(data.map((item) => item.city))];
    return cities;
  }

  async findCommunesByCity(region: string, city: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("delivery_zones")
      .select("commune")
      .eq("region", region)
      .eq("city", city)
      .eq("is_active", true)
      .not("commune", "is", null)
      .order("commune", { ascending: true });

    if (error || !data) {
      return [];
    }

    // Retourner les communes uniques (en filtrant les null)
    const communes = [
      ...new Set(data.map((item) => item.commune).filter(Boolean)),
    ];
    return communes;
  }

  private mapToDeliveryZone(data: any): DeliveryZone {
    return {
      id: data.id,
      region: data.region,
      city: data.city,
      commune: data.commune,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapToDeliveryCost(data: any): DeliveryCost {
    return {
      id: data.id,
      zoneId: data.zone_id,
      baseFee: data.base_fee,
      weightMultiplier: data.weight_multiplier,
      distanceMultiplier: data.distance_multiplier,
      minFee: data.min_fee,
      maxFee: data.max_fee,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
