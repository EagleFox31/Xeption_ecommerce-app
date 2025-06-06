/**
 * DTOs pour le module delivery
 * Validation des données d'entrée et de sortie
 */

import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsNotEmpty,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CalculateDeliveryFeeDto {
  @ApiProperty({ description: "Région de livraison", example: "Centre" })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ description: "Ville de livraison", example: "Yaoundé" })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({
    description: "Commune de livraison",
    example: "Mfoundi",
  })
  @IsString()
  @IsOptional()
  commune?: string;

  @ApiPropertyOptional({ description: "Poids du colis en kg", example: 2.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ description: "Distance en km", example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  distance?: number;
}

export class DeliveryCalculationResponseDto {
  @ApiProperty({ description: "ID de la zone de livraison" })
  zoneId: string;

  @ApiProperty({ description: "Région" })
  region: string;

  @ApiProperty({ description: "Ville" })
  city: string;

  @ApiPropertyOptional({ description: "Commune" })
  commune?: string;

  @ApiProperty({ description: "Frais de base en FCFA" })
  baseFee: number;

  @ApiProperty({ description: "Frais liés au poids en FCFA" })
  weightFee: number;

  @ApiProperty({ description: "Frais liés à la distance en FCFA" })
  distanceFee: number;

  @ApiProperty({ description: "Frais total en FCFA" })
  totalFee: number;

  @ApiProperty({ description: "Estimation en jours" })
  estimatedDays: number;
}

export class DeliveryZoneResponseDto {
  @ApiProperty({ description: "ID de la zone" })
  id: string;

  @ApiProperty({ description: "Région" })
  region: string;

  @ApiProperty({ description: "Ville" })
  city: string;

  @ApiPropertyOptional({ description: "Commune" })
  commune?: string;

  @ApiProperty({ description: "Zone active" })
  isActive: boolean;
}

export class CheckDeliveryAvailabilityDto {
  @ApiProperty({ description: "Région de livraison" })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ description: "Ville de livraison" })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ description: "Commune de livraison" })
  @IsString()
  @IsOptional()
  commune?: string;
}
