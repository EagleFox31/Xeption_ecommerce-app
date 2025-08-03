import { Injectable, ForbiddenException, Inject } from "@nestjs/common";
import { RFQRepository, RFQ_REPOSITORY } from "../../domain/rfq/rfq.port";
import { RFQ, RFQStatus } from "../../domain/rfq/rfq.entity";

@Injectable()
export class GetAllRFQsUseCase {
  constructor(
    @Inject(RFQ_REPOSITORY)
    private readonly rfqRepository: RFQRepository
  ) {}

  async execute(userRole: string, status?: RFQStatus): Promise<RFQ[]> {
    // Only agents and admins can view all RFQs
    if (!["agent", "admin"].includes(userRole)) {
      throw new ForbiddenException("Insufficient permissions to view all RFQs");
    }

    if (status) {
      return this.rfqRepository.getRFQsByStatus(status);
    }

    return this.rfqRepository.getAllRFQs();
  }
}
