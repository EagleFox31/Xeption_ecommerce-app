import { Injectable, Inject } from "@nestjs/common";
import { RFQRepository, RFQ_REPOSITORY } from "../../domain/rfq/rfq.port";
import { RFQRequest } from "../../domain/rfq/rfq.entity";

@Injectable()
export class GetUserRFQRequestsUseCase {
  constructor(
    @Inject(RFQ_REPOSITORY)
    private readonly rfqRepository: RFQRepository
  ) {}

  async execute(userId: string): Promise<RFQRequest[]> {
    return this.rfqRepository.getUserRFQRequests(userId);
  }
}
