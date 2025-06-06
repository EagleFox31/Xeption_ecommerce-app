import { Injectable, NotFoundException } from "@nestjs/common";
import { RFQRepository } from "../../domain/rfq/rfq.port";
import { RFQRequest, RFQItem } from "../../domain/rfq/rfq.entity";

export interface RFQRequestWithItems extends RFQRequest {
  items: RFQItem[];
}

@Injectable()
export class GetRFQRequestUseCase {
  constructor(private readonly rfqRepository: RFQRepository) {}

  async execute(id: string, userId?: string): Promise<RFQRequestWithItems> {
    const rfqRequest = await this.rfqRepository.getRFQRequestById(id);

    if (!rfqRequest) {
      throw new NotFoundException("RFQ request not found");
    }

    // If userId is provided, check ownership (for client role)
    if (userId && rfqRequest.createdBy !== userId) {
      throw new NotFoundException("RFQ request not found");
    }

    const items = await this.rfqRepository.getRFQItems(id);

    return {
      ...rfqRequest,
      items,
    };
  }
}
