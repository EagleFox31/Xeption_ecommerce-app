import { Injectable, Inject } from "@nestjs/common";
import { REPAIR_REPOSITORY, RepairRepositoryPort } from "../../domain/repair/repair.port";
import { RepairAppointment } from "../../domain/repair/repair.entity";

export interface GetUserAppointmentsQuery {
  userId: string;
}

@Injectable()
export class GetUserAppointmentsUseCase {
  constructor(
    @Inject(REPAIR_REPOSITORY)
    private readonly repairRepository: RepairRepositoryPort
  ) {}

  async execute(query: GetUserAppointmentsQuery): Promise<RepairAppointment[]> {
    return await this.repairRepository.getUserAppointments(query.userId);
  }
}
