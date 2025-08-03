import { Injectable, Inject } from "@nestjs/common";
import { REPAIR_REPOSITORY, RepairRepositoryPort } from "../../domain/repair/repair.port";
import {
  Technician,
  TechnicianSpecialty,
} from "../../domain/repair/repair.entity";

export interface GetAvailableTechniciansQuery {
  specialty: TechnicianSpecialty;
  region: string;
  city: string;
}

@Injectable()
export class GetAvailableTechniciansUseCase {
  constructor(
    @Inject(REPAIR_REPOSITORY)
    private readonly repairRepository: RepairRepositoryPort
  ) {}

  async execute(query: GetAvailableTechniciansQuery): Promise<Technician[]> {
    // Validation des paramètres d'entrée
    if (!Object.values(TechnicianSpecialty).includes(query.specialty)) {
      throw new Error("Invalid technician specialty");
    }

    if (!query.region || !query.city) {
      throw new Error("Region and city are required");
    }

    return await this.repairRepository.getAvailableTechnicians(
      query.specialty,
      {
        region: query.region,
        city: query.city,
      },
    );
  }
}
