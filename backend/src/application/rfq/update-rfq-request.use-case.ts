import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import { RFQRepository, RFQ_REPOSITORY } from "../../domain/rfq/rfq.port";
import { RFQRequest, RFQStatus } from "../../domain/rfq/rfq.entity";

export interface UpdateRFQRequestCommand {
  id: string;
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  budgetMinXaf?: number;
  budgetMaxXaf?: number;
  isUrgent?: boolean;
  comment?: string;
  deadline?: Date;
  rfqStatus?: RFQStatus;
  userId: string;
  userRole: string;
}

@Injectable()
export class UpdateRFQRequestUseCase {
  constructor(
    @Inject(RFQ_REPOSITORY)
    private readonly rfqRepository: RFQRepository
  ) {}

  async execute(command: UpdateRFQRequestCommand): Promise<RFQRequest> {
    const existingRFQ = await this.rfqRepository.getRFQRequestById(command.id);

    if (!existingRFQ) {
      throw new NotFoundException("RFQ request not found");
    }

    // Check permissions
    if (
      command.userRole === "client" &&
      existingRFQ.createdBy !== command.userId
    ) {
      throw new ForbiddenException("You can only update your own RFQ requests");
    }

    // Clients can only update draft RFQs
    if (
      command.userRole === "client" &&
      existingRFQ.rfqStatus !== RFQStatus.DRAFT
    ) {
      throw new ForbiddenException("You can only update draft RFQ requests");
    }

    const updates: Partial<RFQRequest> = {
      companyName: command.companyName,
      contactName: command.contactName,
      contactEmail: command.contactEmail,
      budgetMinXaf: command.budgetMinXaf,
      budgetMaxXaf: command.budgetMaxXaf,
      isUrgent: command.isUrgent,
      comment: command.comment,
      deadline: command.deadline,
    };

    // Only agents and admins can update status
    if (["agent", "admin"].includes(command.userRole) && command.rfqStatus) {
      updates.rfqStatus = command.rfqStatus;
    }

    return this.rfqRepository.updateRFQRequest(command.id, updates);
  }
}
