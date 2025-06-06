import { Injectable } from "@nestjs/common";
import { RFQRepository } from "../../domain/rfq/rfq.port";
import { RFQRequest } from "../../domain/rfq/rfq.entity";

@Injectable()
export class GetUserRFQRequestsUseCase {
  constructor(private readonly rfqRepository: RFQRepository) {}

  async execute(userId: string): Promise<RFQRequest[]> {
    return this.rfqRepository.getUserRFQRequests(userId);
  }
}
