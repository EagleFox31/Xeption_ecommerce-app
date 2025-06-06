import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsEnum,
  IsDateString,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { RFQStatus } from "../../../domain/rfq/rfq.entity";

export class CreateRFQItemDto {
  @IsNumber()
  categoryId: number;

  @IsNumber()
  @Min(1)
  qty: number;

  @IsOptional()
  @IsString()
  specsNote?: string;
}

export class CreateRFQRequestDto {
  @IsString()
  companyName: string;

  @IsString()
  contactName: string;

  @IsEmail()
  contactEmail: string;

  @IsOptional()
  @IsNumber()
  budgetMinXaf?: number;

  @IsOptional()
  @IsNumber()
  budgetMaxXaf?: number;

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRFQItemDto)
  items: CreateRFQItemDto[];
}

export class UpdateRFQRequestDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsNumber()
  budgetMinXaf?: number;

  @IsOptional()
  @IsNumber()
  budgetMaxXaf?: number;

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsEnum(RFQStatus)
  rfqStatus?: RFQStatus;
}

export class CreateRFQResponseDto {
  @IsString()
  answerDocUrl: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsDateString()
  deliveryDeadline?: string;
}

export class RFQItemResponseDto {
  id: number;
  rfqId: string;
  categoryId: number;
  qty: number;
  specsNote?: string;
}

export class RFQRequestResponseDto {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  budgetMinXaf?: number;
  budgetMaxXaf?: number;
  isUrgent: boolean;
  comment?: string;
  deadline?: string;
  submittedAt: string;
  createdBy?: string;
  rfqStatus: RFQStatus;
  items?: RFQItemResponseDto[];
}

export class RFQResponseDto {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  budgetMinXaf?: number;
  budgetMaxXaf?: number;
  status: RFQStatus;
  answerDocUrl?: string;
  createdAt: string;
  isUrgent: boolean;
  comment?: string;
  deliveryDeadline?: string;
  submittedAt?: string;
  createdBy?: string;
  rfqStatus: RFQStatus;
}
