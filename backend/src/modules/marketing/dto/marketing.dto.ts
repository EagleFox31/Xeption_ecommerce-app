import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsUrl,
  Min,
} from "class-validator";

/**
 * Create Marketing Banner DTO
 * Data transfer object for creating a new banner
 */
export class CreateMarketingBannerDto {
  @IsString()
  title_237: string;

  @IsOptional()
  @IsString()
  description_237?: string;

  @IsUrl()
  image_url: string;

  @IsOptional()
  @IsUrl()
  cta_url?: string;

  @IsOptional()
  @IsString()
  category_id?: string;

  @IsNumber()
  @Min(0)
  priority: number;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsBoolean()
  active: boolean;
}

/**
 * Update Marketing Banner DTO
 * Data transfer object for updating an existing banner
 */
export class UpdateMarketingBannerDto {
  @IsOptional()
  @IsString()
  title_237?: string;

  @IsOptional()
  @IsString()
  description_237?: string;

  @IsOptional()
  @IsUrl()
  image_url?: string;

  @IsOptional()
  @IsUrl()
  cta_url?: string;

  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

/**
 * Toggle Banner Status DTO
 * Data transfer object for toggling banner active status
 */
export class ToggleBannerStatusDto {
  @IsBoolean()
  active: boolean;
}

/**
 * Marketing Banner Response DTO
 * Data transfer object for banner responses
 */
export class MarketingBannerResponseDto {
  id: string;
  title_237: string;
  description_237?: string;
  image_url: string;
  cta_url?: string;
  category_id?: string;
  priority: number;
  start_date: string;
  end_date: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}
