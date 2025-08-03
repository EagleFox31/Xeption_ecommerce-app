import { Injectable, Inject } from "@nestjs/common";
import { Technician, TechnicianSpecialty } from "./repair.entity";
import {
  TECHNICIAN_REPOSITORY,
  TechnicianRepositoryPort,
} from "./technician.repository.port";

@Injectable()
export class TechnicianMatcherService {
  constructor(
    @Inject(TECHNICIAN_REPOSITORY)
    private readonly technicianRepository: TechnicianRepositoryPort,
  ) {}

  async findBestTechnician(
    specialty: TechnicianSpecialty,
    location: { region: string; city: string },
  ): Promise<Technician | null> {
    const technicians = await this.technicianRepository.findAvailable({
      specialty,
      location,
    });

    if (technicians.length === 0) {
      return null;
    }

    const techniciansWithScore = technicians.map((tech) => {
      let score = 0;
      if (tech.isAvailable) {
        score += 50;
      }
      if (tech.specialties.includes(specialty)) {
        score += 30;
      }
      if (
        tech.location.region === location.region &&
        (!location.city || tech.location.city === location.city)
      ) {
        score += 20;
      }
      score += tech.rating * 2;
      return { tech, score };
    });

    techniciansWithScore.sort((a, b) => b.score - a.score);
    return techniciansWithScore[0].tech;
  }
}
