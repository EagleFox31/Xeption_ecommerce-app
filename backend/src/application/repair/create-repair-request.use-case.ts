import { Injectable } from "@nestjs/common";
import { RepairRepository } from "../../domain/repair/repair.port";
import { RepairRequest, RepairStatus } from "../../domain/repair/repair.entity";

export interface CreateRepairRequestCommand {
  userId: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  issueDescription: string;
  urgencyLevel: "low" | "medium" | "high";
}

@Injectable()
export class CreateRepairRequestUseCase {
  constructor(private readonly repairRepository: RepairRepository) {}

  async execute(command: CreateRepairRequestCommand): Promise<RepairRequest> {
    // Validation des données d'entrée
    if (!command.userId || !command.deviceType || !command.issueDescription) {
      throw new Error("Missing required fields");
    }

    if (!["low", "medium", "high"].includes(command.urgencyLevel)) {
      throw new Error("Invalid urgency level");
    }

    // Création de la demande de réparation
    const repairRequestData = {
      userId: command.userId,
      deviceType: command.deviceType,
      deviceBrand: command.deviceBrand,
      deviceModel: command.deviceModel,
      issueDescription: command.issueDescription,
      urgencyLevel: command.urgencyLevel,
      status: RepairStatus.PENDING,
    };

    return await this.repairRepository.createRepairRequest(repairRequestData);
  }
}
