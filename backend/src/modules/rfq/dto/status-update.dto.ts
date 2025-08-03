import { IsEnum, IsOptional, IsString } from "class-validator";
import { RFQStatus } from "../../../domain/rfq/rfq.entity";

export class UpdateRFQStatusDto {
  @IsEnum(RFQStatus)
  status: RFQStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class SubmitRFQDto {
  @IsOptional()
  @IsString()
  comment?: string;
}