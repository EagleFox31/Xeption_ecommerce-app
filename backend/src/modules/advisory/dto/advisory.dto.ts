import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  IsDateString,
  Min,
  Max,
  ValidateNested,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";
import {
  AdvisoryRequestStatus,
  AdvisoryRequestPriority,
} from "../../domain/advisory/advisory.entity";

export class AdvisoryBudgetDto {
  @IsNumber()
  @Min(0)
  min_amount: number;

  @IsNumber()
  @Min(0)
  max_amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string = "XAF";

  @IsBoolean()
  @IsOptional()
  is_flexible?: boolean = false;
}

export class AdvisoryPreferencesDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  brands?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @IsString()
  @IsOptional()
  use_case?: string;

  @IsEnum(["beginner", "intermediate", "advanced"])
  @IsOptional()
  experience_level?: "beginner" | "intermediate" | "advanced";
}

export class CreateAdvisoryRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @ValidateNested()
  @Type(() => AdvisoryBudgetDto)
  budget: AdvisoryBudgetDto;

  @ValidateNested()
  @Type(() => AdvisoryPreferencesDto)
  @IsOptional()
  preferences?: AdvisoryPreferencesDto;

  @IsDateString()
  @IsOptional()
  deadline?: string;
}

export class UpdateAdvisoryRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @ValidateNested()
  @Type(() => AdvisoryBudgetDto)
  @IsOptional()
  budget?: AdvisoryBudgetDto;

  @ValidateNested()
  @Type(() => AdvisoryPreferencesDto)
  @IsOptional()
  preferences?: AdvisoryPreferencesDto;

  @IsEnum(AdvisoryRequestStatus)
  @IsOptional()
  status?: AdvisoryRequestStatus;

  @IsDateString()
  @IsOptional()
  deadline?: string;
}

export class AdvisoryRequestQueryDto {
  @IsEnum(AdvisoryRequestStatus)
  @IsOptional()
  status?: AdvisoryRequestStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  min_budget?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  max_budget?: number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  has_response?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  is_overdue?: boolean;

  @IsString()
  @IsOptional()
  sort_by?: "created_at" | "updated_at" | "deadline" | "budget";

  @IsString()
  @IsOptional()
  sort_order?: "asc" | "desc";

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

export class GetProductRecommendationsDto {
  @ValidateNested()
  @Type(() => AdvisoryBudgetDto)
  budget: AdvisoryBudgetDto;

  @ValidateNested()
  @Type(() => AdvisoryPreferencesDto)
  @IsOptional()
  preferences?: AdvisoryPreferencesDto;

  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

export class AdvisoryRequestResponseDto {
  id: string;
  user_id: string;
  title: string;
  description: string;
  budget: AdvisoryBudgetDto;
  preferences: AdvisoryPreferencesDto;
  status: AdvisoryRequestStatus;
  priority: AdvisoryRequestPriority;
  response?: any;
  created_at: Date;
  updated_at: Date;
  deadline?: Date;
}

export class AdvisoryRequestListResponseDto {
  requests: AdvisoryRequestResponseDto[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
