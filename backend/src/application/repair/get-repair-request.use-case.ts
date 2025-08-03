import { Injectable, Inject } from "@nestjs/common";
import { REPAIR_REPOSITORY, RepairRepositoryPort } from "../../domain/repair/repair.port";
import { RepairRequest } from "../../domain/repair/repair.entity";

export interface GetRepairRequestQuery {
  repairRequestId: string;
  userId: string;
}

@Injectable()
export class GetRepairRequestUseCase {
  constructor(
    @Inject(REPAIR_REPOSITORY)
    private readonly repairRepository: RepairRepositoryPort
  ) {}

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
