/**
 * Controller pour le module delivery
 * Endpoints REST pour le calcul des frais de livraison
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthGuard } from "../../common/auth/auth.guard";
import { DeliveryService } from "./delivery.service";
import {
  CalculateDeliveryFeeDto,
  DeliveryCalculationResponseDto,
  DeliveryZoneResponseDto,
  CheckDeliveryAvailabilityDto,
} from "./dto/delivery.dto";

@ApiTags("Delivery")
@Controller("delivery")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post("calculate-fee")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Calculer les frais de livraison" })
  @ApiResponse({
    status: 200,
    description: "Frais de livraison calculés avec succès",
    type: DeliveryCalculationResponseDto,
  })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 404, description: "Zone de livraison non trouvée" })
  async calculateDeliveryFee(
    @Body() calculateDto: CalculateDeliveryFeeDto,
  ): Promise<DeliveryCalculationResponseDto> {
    return await this.deliveryService.calculateDeliveryFee(calculateDto);
  }

  @Post("check-availability")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Vérifier la disponibilité de livraison" })
  @ApiResponse({
    status: 200,
    description: "Disponibilité vérifiée",
    schema: { type: "object", properties: { available: { type: "boolean" } } },
  })
  async checkDeliveryAvailability(
    @Body() checkDto: CheckDeliveryAvailabilityDto,
  ): Promise<{ available: boolean }> {
    const available = await this.deliveryService.isDeliveryAvailable(
      checkDto.region,
      checkDto.city,
      checkDto.commune,
    );
    return { available };
  }

  @Get("zones")
  @ApiOperation({ summary: "Lister les zones de livraison disponibles" })
  @ApiResponse({
    status: 200,
    description: "Liste des zones de livraison",
    type: [DeliveryZoneResponseDto],
  })
  async getAvailableZones(): Promise<DeliveryZoneResponseDto[]> {
    return await this.deliveryService.getAvailableZones();
  }

  @Get("regions")
  @ApiOperation({ summary: "Lister les régions disponibles" })
  @ApiResponse({
    status: 200,
    description: "Liste des régions",
    schema: { type: "array", items: { type: "string" } },
  })
  async getAvailableRegions(): Promise<string[]> {
    return await this.deliveryService.getAvailableRegions();
  }

  @Get("cities")
  @ApiOperation({ summary: "Lister les villes d'une région" })
  @ApiResponse({
    status: 200,
    description: "Liste des villes",
    schema: { type: "array", items: { type: "string" } },
  })
  async getCitiesByRegion(@Query("region") region: string): Promise<string[]> {
    return await this.deliveryService.getCitiesByRegion(region);
  }

  @Get("communes")
  @ApiOperation({ summary: "Lister les communes d'une ville" })
  @ApiResponse({
    status: 200,
    description: "Liste des communes",
    schema: { type: "array", items: { type: "string" } },
  })
  async getCommunesByCity(
    @Query("region") region: string,
    @Query("city") city: string,
  ): Promise<string[]> {
    return await this.deliveryService.getCommunesByCity(region, city);
  }
}
