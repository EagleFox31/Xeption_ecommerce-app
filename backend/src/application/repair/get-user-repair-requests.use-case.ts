import { Injectable, Inject } from "@nestjs/common";
import { REPAIR_REPOSITORY, RepairRepositoryPort } from "../../domain/repair/repair.port";
import { RepairRequest } from "../../domain/repair/repair.entity";

export interface GetUserRepairRequestsQuery {
  userId: string;
}

@Injectable()
export class GetUserRepairRequestsUseCase {
  constructor(
    @Inject(REPAIR_REPOSITORY)
    private readonly repairRepository: RepairRepositoryPort
  ) {}

  async execute(query: GetUserRepairRequestsQuery): Promise<RepairRequest[]> {
    return await this.repairRepository.getUserRepairRequests(query.userId);
  }
}
