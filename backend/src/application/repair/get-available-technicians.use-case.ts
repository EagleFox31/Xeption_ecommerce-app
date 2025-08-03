import { Injectable, Inject } from "@nestjs/common";
import {
  TECHNICIAN_REPOSITORY,
  TechnicianRepositoryPort,
} from "../../domain/repair/technician.repository.port";
import { Technician, TechnicianSpecialty } from "../../domain/repair/repair.entity";

export interface GetAvailableTechniciansQuery {
  specialty: TechnicianSpecialty;
  region: string;
  city: string;
}

@Injectable()
export class GetAvailableTechniciansUseCase {
  constructor(
    @Inject(TECHNICIAN_REPOSITORY)
    private readonly technicianRepository: TechnicianRepositoryPort
  ) {}

  async execute(query: GetAvailableTechniciansQuery): Promise<Technician[]> {
    // Validation des paramètres d'entrée
    if (!Object.values(TechnicianSpecialty).includes(query.specialty)) {
      throw new Error("Invalid technician specialty");
    }

    if (!query.region || !query.city) {
      throw new Error("Region and city are required");
    }

    return await this.technicianRepository.findAvailable({
      specialty: query.specialty,
      location: {
        region: query.region,
        city: query.city,
      },
    });
  }
}
