import { Injectable, Inject } from "@nestjs/common";
import {
  REPAIR_REPOSITORY,
  RepairRepositoryPort,
} from "../../domain/repair/repair.port";
import { RepairPricingService } from "../../domain/repair/repair-pricing.service";
import { TechnicianMatcherService } from "../../domain/repair/technician-matcher.service";
import {
  RepairRequest,
  RepairStatus,
  TechnicianSpecialty,
} from "../../domain/repair/repair.entity";

export interface ScheduleRepairCommand {
  userId: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  issueDescription: string;
  urgencyLevel: "low" | "medium" | "high";
  specialty: TechnicianSpecialty;
  location: { region: string; city: string };
}

@Injectable()
export class ScheduleRepairUseCase {
  constructor(
    @Inject(REPAIR_REPOSITORY)
    private readonly repairRepository: RepairRepositoryPort,
    private readonly pricingService: RepairPricingService,
    private readonly matcherService: TechnicianMatcherService,
  ) {}

  async execute(command: ScheduleRepairCommand): Promise<RepairRequest> {
    const cost = await this.pricingService.calculateRepairCost(
      command.deviceType,
      command.issueDescription,
    );

    const technician = await this.matcherService.findBestTechnician(
      command.specialty,
      command.location,
    );

    const repairRequest = await this.repairRepository.createRepairRequest({
      userId: command.userId,
      deviceType: command.deviceType,
      deviceBrand: command.deviceBrand,
      deviceModel: command.deviceModel,
      issueDescription: command.issueDescription,
      urgencyLevel: command.urgencyLevel,
      estimatedCost: (cost.min + cost.max) / 2,
      status: RepairStatus.PENDING,
      technicianId: technician ? technician.id : undefined,
    });

    return repairRequest;
  }
}
