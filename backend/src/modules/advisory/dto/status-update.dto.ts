import { IsString, IsNotEmpty, IsEnum, IsOptional } from "class-validator";
import { AdvisoryRequestStatus } from "../../../domain/advisory/advisory.entity";

export class UpdateAdvisoryRequestStatusDto {
  @IsEnum(AdvisoryRequestStatus)
  @IsNotEmpty()
  status: AdvisoryRequestStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}