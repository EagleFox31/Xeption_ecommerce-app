import { Injectable } from "@nestjs/common";
import { RepairRepository } from "../../domain/repair/repair.port";
import { RepairAppointment } from "../../domain/repair/repair.entity";

export interface GetUserAppointmentsQuery {
  userId: string;
}

@Injectable()
export class GetUserAppointmentsUseCase {
  constructor(private readonly repairRepository: RepairRepository) {}

  async execute(query: GetUserAppointmentsQuery): Promise<RepairAppointment[]> {
    return await this.repairRepository.getUserAppointments(query.userId);
  }
}
