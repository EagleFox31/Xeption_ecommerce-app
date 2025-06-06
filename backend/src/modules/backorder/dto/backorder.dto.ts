/**
 * DTOs pour le module backorder
 * Validation des données d'entrée et de sortie
 */

import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
  ValidateNested,
  Min,
  Max,
  IsUUID,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";
import {
  BackorderStatus,
  BackorderPriority,
} from "../../domain/backorder/backorder.entity";

// DTOs pour les préférences de notification
export class NotificationPreferencesDto {
  @IsBoolean()
  email: boolean;

  @IsBoolean()
  sms: boolean;

  @IsBoolean()
  push: boolean;
}

// DTO pour créer une demande de précommande
export class CreateBackorderRequestDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsEnum(BackorderPriority)
  priority?: BackorderPriority;

  @IsObject()
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  notificationPreferences: NotificationPreferencesDto;

  @IsOptional()
  @IsString()
  @Max(500)
  notes?: string;
}

// DTO pour mettre à jour une demande de précommande
export class UpdateBackorderRequestDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsEnum(BackorderPriority)
  priority?: BackorderPriority;

  @IsOptional()
  @IsEnum(BackorderStatus)
  status?: BackorderStatus;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  notificationPreferences?: NotificationPreferencesDto;

  @IsOptional()
  @IsString()
  @Max(500)
  notes?: string;
}

// DTO pour annuler une demande de précommande
export class CancelBackorderRequestDto {
  @IsOptional()
  @IsString()
  @Max(200)
  reason?: string;
}

// DTO pour les filtres de recherche
export class BackorderRequestFiltersDto {
  @IsOptional()
  @IsEnum(BackorderStatus)
  status?: BackorderStatus;

  @IsOptional()
  @IsEnum(BackorderPriority)
  priority?: BackorderPriority;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

// DTO de réponse pour une demande de précommande
export class BackorderRequestResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @IsEnum(BackorderPriority)
  priority: BackorderPriority;

  @IsEnum(BackorderStatus)
  status: BackorderStatus;

  @IsObject()
  notificationPreferences: NotificationPreferencesDto;

  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  createdAt: string;

  @IsDateString()
  updatedAt: string;
}

// DTO de réponse pour la liste des demandes
export class BackorderRequestListResponseDto {
  @ValidateNested({ each: true })
  @Type(() => BackorderRequestResponseDto)
  requests: BackorderRequestResponseDto[];

  @IsNumber()
  total: number;

  @IsBoolean()
  hasMore: boolean;
}
