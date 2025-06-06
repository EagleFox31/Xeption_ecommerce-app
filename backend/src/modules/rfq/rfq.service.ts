import { Injectable } from "@nestjs/common";
import { CreateRFQRequestUseCase } from "../../application/rfq/create-rfq-request.use-case";
import { GetRFQRequestUseCase } from "../../application/rfq/get-rfq-request.use-case";
import { GetUserRFQRequestsUseCase } from "../../application/rfq/get-user-rfq-requests.use-case";
import { UpdateRFQRequestUseCase } from "../../application/rfq/update-rfq-request.use-case";
import { GetAllRFQsUseCase } from "../../application/rfq/get-all-rfqs.use-case";
import { CreateRFQResponseUseCase } from "../../application/rfq/create-rfq-response.use-case";
import {
  CreateRFQRequestDto,
  UpdateRFQRequestDto,
  CreateRFQResponseDto,
} from "./dto/rfq.dto";
import { AuthenticatedUser } from "../../common/auth/jwt.types";
import { RFQStatus } from "../../domain/rfq/rfq.entity";

@Injectable()
export class RFQService {
  constructor(
    private readonly createRFQRequestUseCase: CreateRFQRequestUseCase,
    private readonly getRFQRequestUseCase: GetRFQRequestUseCase,
    private readonly getUserRFQRequestsUseCase: GetUserRFQRequestsUseCase,
    private readonly updateRFQRequestUseCase: UpdateRFQRequestUseCase,
    private readonly getAllRFQsUseCase: GetAllRFQsUseCase,
    private readonly createRFQResponseUseCase: CreateRFQResponseUseCase,
  ) {}

  async createRFQRequest(dto: CreateRFQRequestDto, user: AuthenticatedUser) {
    return this.createRFQRequestUseCase.execute({
      companyName: dto.companyName,
      contactName: dto.contactName,
      contactEmail: dto.contactEmail,
      budgetMinXaf: dto.budgetMinXaf,
      budgetMaxXaf: dto.budgetMaxXaf,
      isUrgent: dto.isUrgent,
      comment: dto.comment,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      createdBy: user.id,
      items: dto.items,
    });
  }

  async getRFQRequest(id: string, user: AuthenticatedUser) {
    const userId = user.role === "client" ? user.id : undefined;
    return this.getRFQRequestUseCase.execute(id, userId);
  }

  async getUserRFQRequests(user: AuthenticatedUser) {
    return this.getUserRFQRequestsUseCase.execute(user.id);
  }

  async updateRFQRequest(
    id: string,
    dto: UpdateRFQRequestDto,
    user: AuthenticatedUser,
  ) {
    return this.updateRFQRequestUseCase.execute({
      id,
      companyName: dto.companyName,
      contactName: dto.contactName,
      contactEmail: dto.contactEmail,
      budgetMinXaf: dto.budgetMinXaf,
      budgetMaxXaf: dto.budgetMaxXaf,
      isUrgent: dto.isUrgent,
      comment: dto.comment,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      rfqStatus: dto.rfqStatus,
      userId: user.id,
      userRole: user.role || "client",
    });
  }

  async getAllRFQs(user: AuthenticatedUser, status?: RFQStatus) {
    return this.getAllRFQsUseCase.execute(user.role || "client", status);
  }

  async createRFQResponse(
    rfqRequestId: string,
    dto: CreateRFQResponseDto,
    user: AuthenticatedUser,
  ) {
    return this.createRFQResponseUseCase.execute({
      rfqRequestId,
      answerDocUrl: dto.answerDocUrl,
      comment: dto.comment,
      deliveryDeadline: dto.deliveryDeadline
        ? new Date(dto.deliveryDeadline)
        : undefined,
      agentId: user.id,
      userRole: user.role || "client",
    });
  }
}
