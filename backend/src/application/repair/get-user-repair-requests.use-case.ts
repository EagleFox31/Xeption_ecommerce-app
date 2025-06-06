import { Injectable } from "@nestjs/common";
import { RepairRepository } from "../../domain/repair/repair.port";
import { RepairRequest } from "../../domain/repair/repair.entity";

export interface GetUserRepairRequestsQuery {
  userId: string;
}

@Injectable()
export class GetUserRepairRequestsUseCase {
  constructor(private readonly repairRepository: RepairRepository) {}

  async execute(query: GetUserRepairRequestsQuery): Promise<RepairRequest[]> {
    return await this.repairRepository.getUserRepairRequests(query.userId);
  }
}
