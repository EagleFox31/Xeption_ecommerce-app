import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";
import {
  TechnicianSpecialty,
  AppointmentTimeSlot,
} from "../../../domain/repair/repair.entity";

export class CreateRepairRequestDto {
  @IsString()
  deviceType: string;

  @IsString()
  deviceBrand: string;

  @IsString()
  deviceModel: string;

  @IsString()
  issueDescription: string;

  @IsEnum(["low", "medium", "high"])
  urgencyLevel: "low" | "medium" | "high";
}

export class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  commune: string;

  @IsString()
  region: string;

  @IsOptional()
  @IsString()
  postalCode?: string;
}

export class ScheduleAppointmentDto {
  @IsString()
  repairRequestId: string;

  @IsString()
  technicianId: string;

  @IsDateString()
  scheduledDate: string;

  @IsEnum(AppointmentTimeSlot)
  timeSlot: AppointmentTimeSlot;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class GetAvailableTechniciansDto {
  @IsEnum(TechnicianSpecialty)
  specialty: TechnicianSpecialty;

  @IsString()
  region: string;

  @IsString()
  city: string;
}

export class CancelAppointmentDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateRepairRequestDto {
  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  deviceBrand?: string;

  @IsOptional()
  @IsString()
  deviceModel?: string;

  @IsOptional()
  @IsString()
  issueDescription?: string;

  @IsOptional()
  @IsEnum(["low", "medium", "high"])
  urgencyLevel?: "low" | "medium" | "high";
}

export class RepairRequestResponseDto {
  id: string;
  userId: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  issueDescription: string;
  urgencyLevel: "low" | "medium" | "high";
  estimatedCost?: number;
  actualCost?: number;
  status: string;
  technicianId?: string;
  appointmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TechnicianResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: TechnicianSpecialty[];
  rating: number;
  isAvailable: boolean;
  location: {
    region: string;
    city: string;
    commune: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class AppointmentResponseDto {
  id: string;
  repairRequestId: string;
  technicianId: string;
  userId: string;
  scheduledDate: Date;
  timeSlot: AppointmentTimeSlot;
  address: {
    street: string;
    city: string;
    commune: string;
    region: string;
    postalCode?: string;
  };
  notes?: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export class PartNeededDto {
  @IsString()
  name: string;

  @IsNumber()
  cost: number;

  @IsEnum(["in_stock", "order_required"])
  availability: "in_stock" | "order_required";
}

export class CreateEstimateDto {
  @IsString()
  repairRequestId: string;

  @IsNumber()
  estimatedCost: number;

  @IsNumber()
  estimatedDuration: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartNeededDto)
  partsNeeded: PartNeededDto[];

  @IsNumber()
  laborCost: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  validUntil: string;
}

export class EstimateResponseDto {
  id: string;
  repairRequestId: string;
  technicianId: string;
  estimatedCost: number;
  estimatedDuration: number;
  partsNeeded: {
    name: string;
    cost: number;
    availability: "in_stock" | "order_required";
  }[];
  laborCost: number;
  notes?: string;
  validUntil: Date;
  createdAt: Date;
}
