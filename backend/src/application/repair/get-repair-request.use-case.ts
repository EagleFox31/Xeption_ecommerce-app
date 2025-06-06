import { Injectable } from "@nestjs/common";
import { RepairRepository } from "../../domain/repair/repair.port";
import { RepairRequest } from "../../domain/repair/repair.entity";

export interface GetRepairRequestQuery {
  repairRequestId: string;
  userId: string;
}

@Injectable()
export class GetRepairRequestUseCase {
  constructor(private readonly repairRepository: RepairRepository) {}

  async execute(query: GetRepairRequestQuery): Promise<RepairRequest> {
    const repairRequest = await this.repairRepository.getRepairRequestById(
      query.repairRequestId,
    );

    if (!repairRequest) {
      throw new Error("Repair request not found");
    }

    // Vérification que la demande appartient à l'utilisateur
    if (repairRequest.userId !== query.userId) {
      throw new Error("Unauthorized: Repair request does not belong to user");
    }

    return repairRequest;
  }
}
