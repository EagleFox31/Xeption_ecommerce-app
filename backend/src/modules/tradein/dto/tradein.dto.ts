import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsUUID,
} from "class-validator";
import {
  DeviceCondition,
  TradeInStatus,
} from "../../../domain/tradein/tradein.entity";

export class CreateTradeInRequestDto {
  @IsUUID()
  deviceId: string;

  @IsEnum(DeviceCondition)
  condition: DeviceCondition;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class SearchDevicesDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsString()
  category?: string;
}

export class EvaluateTradeInDto {
  @IsEnum(DeviceCondition)
  condition: DeviceCondition;

  @IsNumber()
  @Min(0)
  @Max(100)
  functionalityScore: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  cosmeticScore: number;

  @IsString()
  notes: string;
}

export class UpdateTradeInStatusDto {
  @IsEnum(TradeInStatus)
  status: TradeInStatus;

  @IsOptional()
  @IsString()
  evaluatorNotes?: string;
}

export class TradeInRequestResponseDto {
  id: string;
  userId: string;
  deviceId: string;
  device?: {
    id: string;
    brand: string;
    model: string;
    category: string;
    baseValue: number;
  };
  condition: DeviceCondition;
  description?: string;
  images: string[];
  estimatedValue: number;
  finalValue?: number;
  status: TradeInStatus;
  evaluatorNotes?: string;
  evaluatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class DeviceResponseDto {
  id: string;
  brand: string;
  model: string;
  category: string;
  specifications?: Record<string, any>;
  baseValue: number;
  createdAt: Date;
  updatedAt: Date;
}
