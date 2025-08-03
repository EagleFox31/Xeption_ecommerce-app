import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { AuthGuard } from "../../common/auth/auth.guard";
import { RoleGuard } from "../../common/auth/role.guard";
import { Roles } from "../../common/auth/roles.decorator";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { AuthenticatedUser } from "../../common/auth/jwt.types";
import { RFQService } from "./rfq.service";
import {
  CreateRFQRequestDto,
  UpdateRFQRequestDto,
  CreateRFQResponseDto,
  RFQRequestResponseDto,
  RFQResponseDto,
} from "./dto/rfq.dto";
import { UpdateRFQStatusDto, SubmitRFQDto } from "./dto/status-update.dto";
import { RFQStatus } from "../../domain/rfq/rfq.entity";

/**
 * RFQ API Controller
 *
 * Endpoints are organized by:
 * 1. Client RFQ operations - managing own quote requests
 * 2. Admin RFQ operations - managing all quotes and responses
 * 3. Status transition operations - explicit endpoints for workflow changes
 */
@Controller("rfq")
@UseGuards(AuthGuard)
export class RFQController {
  constructor(private readonly rfqService: RFQService) {}

  /**
   * CLIENT RFQ OPERATIONS
   * Endpoints for customers to manage their quote requests
   */

  /**
   * Create a new RFQ request
   * POST /rfq
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRFQRequest(
    @Body() createRFQRequestDto: CreateRFQRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RFQRequestResponseDto> {
    const result = await this.rfqService.createRFQRequest(
      createRFQRequestDto,
      user,
    );

    return {
      id: result.id,
      companyName: result.companyName,
      contactName: result.contactName,
      contactEmail: result.contactEmail,
      budgetMinXaf: result.budgetMinXaf,
      budgetMaxXaf: result.budgetMaxXaf,
      isUrgent: result.isUrgent,
      comment: result.comment,
      deadline: result.deadline?.toISOString(),
      submittedAt: result.submittedAt.toISOString(),
      createdBy: result.createdBy,
      rfqStatus: result.rfqStatus,
    };
  }

  /**
   * Get RFQ request by ID
   * GET /rfq/:id
   */
  @Get(":id")
  async getRFQRequest(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RFQRequestResponseDto> {
    const result = await this.rfqService.getRFQRequest(id, user);

    return {
      id: result.id,
      companyName: result.companyName,
      contactName: result.contactName,
      contactEmail: result.contactEmail,
      budgetMinXaf: result.budgetMinXaf,
      budgetMaxXaf: result.budgetMaxXaf,
      isUrgent: result.isUrgent,
      comment: result.comment,
      deadline: result.deadline?.toISOString(),
      submittedAt: result.submittedAt.toISOString(),
      createdBy: result.createdBy,
      rfqStatus: result.rfqStatus,
      items: result.items?.map((item) => ({
        id: item.id,
        rfqId: item.rfqId,
        categoryId: item.categoryId,
        qty: item.qty,
        specsNote: item.specsNote,
      })),
    };
  }

  /**
   * Get current user's RFQ requests
   * GET /rfq/my/requests
   */
  @Get("my/requests")
  async getUserRFQRequests(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RFQRequestResponseDto[]> {
    const results = await this.rfqService.getUserRFQRequests(user);

    return results.map((result) => ({
      id: result.id,
      companyName: result.companyName,
      contactName: result.contactName,
      contactEmail: result.contactEmail,
      budgetMinXaf: result.budgetMinXaf,
      budgetMaxXaf: result.budgetMaxXaf,
      isUrgent: result.isUrgent,
      comment: result.comment,
      deadline: result.deadline?.toISOString(),
      submittedAt: result.submittedAt.toISOString(),
      createdBy: result.createdBy,
      rfqStatus: result.rfqStatus,
    }));
  }

  /**
   * Update RFQ request
   * PUT /rfq/:id
   */
  @Put(":id")
  async updateRFQRequest(
    @Param("id") id: string,
    @Body() updateRFQRequestDto: UpdateRFQRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RFQRequestResponseDto> {
    const result = await this.rfqService.updateRFQRequest(
      id,
      updateRFQRequestDto,
      user,
    );

    return {
      id: result.id,
      companyName: result.companyName,
      contactName: result.contactName,
      contactEmail: result.contactEmail,
      budgetMinXaf: result.budgetMinXaf,
      budgetMaxXaf: result.budgetMaxXaf,
      isUrgent: result.isUrgent,
      comment: result.comment,
      deadline: result.deadline?.toISOString(),
      submittedAt: result.submittedAt.toISOString(),
      createdBy: result.createdBy,
      rfqStatus: result.rfqStatus,
    };
  }

  /**
   * ADMIN RFQ OPERATIONS
   * Endpoints for agents and admins to manage quotes
   */

  /**
   * Get all RFQs (for agents and admins)
   * GET /rfq/admin/all
   */
  @Get("admin/all")
  @Roles('admin', 'agent')
  @UseGuards(RoleGuard)
  async getAllRFQs(
    @Query("status") status: RFQStatus,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RFQResponseDto[]> {
    const results = await this.rfqService.getAllRFQs(user, status);

    return results.map((result) => ({
      id: result.id,
      companyName: result.companyName,
      contactName: result.contactName,
      contactEmail: result.contactEmail,
      budgetMinXaf: result.budgetMinXaf,
      budgetMaxXaf: result.budgetMaxXaf,
      status: result.status,
      answerDocUrl: result.answerDocUrl,
      createdAt: result.createdAt.toISOString(),
      isUrgent: result.isUrgent,
      comment: result.comment,
      deliveryDeadline: result.deliveryDeadline?.toISOString(),
      submittedAt: result.submittedAt?.toISOString(),
      createdBy: result.createdBy,
      rfqStatus: result.rfqStatus,
    }));
  }

  /**
   * Create RFQ response (for agents and admins)
   * POST /rfq/:id/response
   */
  @Post(":id/response")
  @Roles('admin', 'agent')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.CREATED)
  async createRFQResponse(
    @Param("id") rfqRequestId: string,
    @Body() createRFQResponseDto: CreateRFQResponseDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RFQResponseDto> {
    const result = await this.rfqService.createRFQResponse(
      rfqRequestId,
      createRFQResponseDto,
      user,
    );

    return {
      id: result.id,
      companyName: result.companyName,
      contactName: result.contactName,
      contactEmail: result.contactEmail,
      budgetMinXaf: result.budgetMinXaf,
      budgetMaxXaf: result.budgetMaxXaf,
      status: result.status,
      answerDocUrl: result.answerDocUrl,
      createdAt: result.createdAt.toISOString(),
      isUrgent: result.isUrgent,
      comment: result.comment,
      deliveryDeadline: result.deliveryDeadline?.toISOString(),
      submittedAt: result.submittedAt?.toISOString(),
      createdBy: result.createdBy,
      rfqStatus: result.rfqStatus,
    };
  }

  /**
   * STATUS TRANSITION OPERATIONS
   * Explicit endpoints for workflow transitions
   */

  /**
   * Update RFQ status (admin only)
   * PATCH /rfq/:id/status
   */
  @Put(":id/status")
  @Roles('admin')
  @UseGuards(RoleGuard)
  async updateRFQStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateRFQStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RFQRequestResponseDto> {
    // Create a minimal update DTO with just the status
    const updateDto: UpdateRFQRequestDto = {
      rfqStatus: updateStatusDto.status,
      comment: updateStatusDto.comment,
    };

    // Call the existing updateRFQRequest method
    const result = await this.rfqService.updateRFQRequest(
      id,
      updateDto,
      user
    );

    return {
      id: result.id,
      companyName: result.companyName,
      contactName: result.contactName,
      contactEmail: result.contactEmail,
      budgetMinXaf: result.budgetMinXaf,
      budgetMaxXaf: result.budgetMaxXaf,
      isUrgent: result.isUrgent,
      comment: result.comment,
      deadline: result.deadline?.toISOString(),
      submittedAt: result.submittedAt.toISOString(),
      createdBy: result.createdBy,
      rfqStatus: result.rfqStatus,
    };
  }

  /**
   * Submit RFQ (client only) - transitions from DRAFT to SUBMITTED
   * PUT /rfq/:id/submit
   */
  @Put(":id/submit")
  async submitRFQ(
    @Param("id") id: string,
    @Body() submitDto: SubmitRFQDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RFQRequestResponseDto> {
    // Create a minimal update DTO with just the status
    const updateDto: UpdateRFQRequestDto = {
      rfqStatus: RFQStatus.SUBMITTED,
      comment: submitDto.comment,
    };

    // Call the existing updateRFQRequest method
    const result = await this.rfqService.updateRFQRequest(
      id,
      updateDto,
      user
    );

    return {
      id: result.id,
      companyName: result.companyName,
      contactName: result.contactName,
      contactEmail: result.contactEmail,
      budgetMinXaf: result.budgetMinXaf,
      budgetMaxXaf: result.budgetMaxXaf,
      isUrgent: result.isUrgent,
      comment: result.comment,
      deadline: result.deadline?.toISOString(),
      submittedAt: result.submittedAt.toISOString(),
      createdBy: result.createdBy,
      rfqStatus: result.rfqStatus,
    };
  }
}
