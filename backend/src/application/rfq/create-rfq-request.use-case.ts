import { Injectable, Inject } from "@nestjs/common";
import { RFQRepository, RFQ_REPOSITORY } from "../../domain/rfq/rfq.port";
import { RFQRequest, RFQItem, RFQStatus } from "../../domain/rfq/rfq.entity";

export interface CreateRFQRequestCommand {
  companyName: string;
  contactName: string;
  contactEmail: string;
  budgetMinXaf?: number;
  budgetMaxXaf?: number;
  isUrgent?: boolean;
  comment?: string;
  deadline?: Date;
  createdBy: string;
  items: Array<{
    categoryId: number;
    qty: number;
    specsNote?: string;
  }>;
}

@Injectable()
export class CreateRFQRequestUseCase {
  constructor(
    @Inject(RFQ_REPOSITORY)
    private readonly rfqRepository: RFQRepository
  ) {}

  async execute(command: CreateRFQRequestCommand): Promise<RFQRequest> {
    // Create the RFQ request
    const rfqRequest = await this.rfqRepository.createRFQRequest({
      companyName: command.companyName,
      contactName: command.contactName,
      contactEmail: command.contactEmail,
      budgetMinXaf: command.budgetMinXaf,
      budgetMaxXaf: command.budgetMaxXaf,
      isUrgent: command.isUrgent || false,
      comment: command.comment,
      deadline: command.deadline,
      createdBy: command.createdBy,
      rfqStatus: RFQStatus.DRAFT,
    });

    // Create RFQ items
    for (const item of command.items) {
      await this.rfqRepository.createRFQItem({
        rfqId: rfqRequest.id,
        categoryId: item.categoryId,
        qty: item.qty,
        specsNote: item.specsNote,
      });
    }

    return rfqRequest;
  }
}
