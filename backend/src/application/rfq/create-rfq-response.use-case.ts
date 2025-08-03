import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import { RFQRepository, RFQ_REPOSITORY } from "../../domain/rfq/rfq.port";
import { RFQ, RFQStatus } from "../../domain/rfq/rfq.entity";

export interface CreateRFQResponseCommand {
  rfqRequestId: string;
  answerDocUrl: string;
  comment?: string;
  deliveryDeadline?: Date;
  agentId: string;
  userRole: string;
}

@Injectable()
export class CreateRFQResponseUseCase {
  constructor(
    @Inject(RFQ_REPOSITORY)
    private readonly rfqRepository: RFQRepository
  ) {}

  async execute(command: CreateRFQResponseCommand): Promise<RFQ> {
    // Only agents and admins can create responses
    if (!["agent", "admin"].includes(command.userRole)) {
      throw new ForbiddenException(
        "Insufficient permissions to create RFQ response",
      );
    }

    const rfqRequest = await this.rfqRepository.getRFQRequestById(
      command.rfqRequestId,
    );

    if (!rfqRequest) {
      throw new NotFoundException("RFQ request not found");
    }

    // Create RFQ response based on the request
    const rfq = await this.rfqRepository.createRFQ({
      companyName: rfqRequest.companyName,
      contactName: rfqRequest.contactName,
      contactEmail: rfqRequest.contactEmail,
      budgetMinXaf: rfqRequest.budgetMinXaf,
      budgetMaxXaf: rfqRequest.budgetMaxXaf,
      status: RFQStatus.ANSWERED,
      answerDocUrl: command.answerDocUrl,
      isUrgent: rfqRequest.isUrgent,
      comment: command.comment,
      deliveryDeadline: command.deliveryDeadline,
      submittedAt: rfqRequest.submittedAt,
      createdBy: command.agentId,
      rfqStatus: RFQStatus.ANSWERED,
    });

    // Update the original request status
    await this.rfqRepository.updateRFQRequest(command.rfqRequestId, {
      rfqStatus: RFQStatus.ANSWERED,
    });

    return rfq;
  }
}
